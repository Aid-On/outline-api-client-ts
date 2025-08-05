#!/bin/bash

# Outline Document Improvement Script
# This script helps improve Outline documents one by one using Claude

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if required commands exist
check_requirements() {
    local missing_commands=()
    
    if ! command -v oln &> /dev/null; then
        missing_commands+=("oln")
    fi
    
    if ! command -v claude &> /dev/null; then
        missing_commands+=("claude")
    fi
    
    if [ ${#missing_commands[@]} -ne 0 ]; then
        print_error "Missing required commands: ${missing_commands[*]}"
        echo "Please install:"
        [ " ${missing_commands[*]} " =~ " oln " ] && echo "  - oln: npm install -g @aid-on-libs/outline-api-client"
        [ " ${missing_commands[*]} " =~ " claude " ] && echo "  - claude: Visit https://claude.ai/download"
        exit 1
    fi
}

# Function to create directory structure
setup_directories() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    export WORK_DIR="outline-improvement-${timestamp}"
    export ORIGINAL_DIR="${WORK_DIR}/original"
    export IMPROVED_DIR="${WORK_DIR}/improved"
    export BACKUP_DIR="${WORK_DIR}/backup"
    
    mkdir -p "$ORIGINAL_DIR" "$IMPROVED_DIR" "$BACKUP_DIR"
    print_success "Created working directory: $WORK_DIR"
}

# Function to search for document
search_document() {
    local title="$1"
    print_info "Searching for document: $title"
    
    # Search and extract document ID
    local search_result=$(oln documents search "$title" 2>/dev/null || true)
    
    if [ -z "$search_result" ]; then
        print_error "No results found for: $title"
        return 1
    fi
    
    # Extract document ID (assuming format: ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    local doc_id=$(echo "$search_result" | grep -oE 'ID: [a-f0-9-]+' | head -1 | cut -d' ' -f2)
    
    if [ -z "$doc_id" ]; then
        print_error "Could not extract document ID from search results"
        echo "$search_result"
        return 1
    fi
    
    echo "$doc_id"
}

# Function to export document
export_document() {
    local doc_id="$1"
    local output_file="$2"
    
    print_info "Exporting document ID: $doc_id"
    
    if oln documents export "$doc_id" -o "$output_file"; then
        print_success "Document exported to: $output_file"
        return 0
    else
        print_error "Failed to export document"
        return 1
    fi
}

# Function to create improvement prompt
create_prompt() {
    local doc_path="$1"
    local improved_path="$2"
    
    cat > "${WORK_DIR}/prompt.txt" << 'EOF'
以下のOutlineドキュメントを改善してください。

改善のポイント：
1. 構造の最適化
   - 見出しの階層を適切に整理
   - 情報の論理的な流れを確保
   - 重複の削除

2. 内容の充実
   - 不足している情報を追加
   - 実践的な例やユースケースを追加
   - ベストプラクティスやTipsを含める

3. 読みやすさの向上
   - 表形式で情報を整理
   - 箇条書きを効果的に使用
   - 視覚的な要素（アイコン、強調）を追加

4. 検索性の向上
   - 適切なキーワードを含める
   - タグの活用を提案
   - 内部リンクの追加

5. 最新情報への更新
   - 古い情報を更新
   - 新機能や変更点を反映

改善したドキュメントを以下のファイルに保存してください：
EOF
    echo "$improved_path" >> "${WORK_DIR}/prompt.txt"
    echo "" >> "${WORK_DIR}/prompt.txt"
    echo "元のドキュメント：" >> "${WORK_DIR}/prompt.txt"
    echo "$doc_path" >> "${WORK_DIR}/prompt.txt"
}

# Function to improve document with Claude
improve_with_claude() {
    local original_path="$1"
    local improved_path="$2"
    
    print_info "Improving document with Claude..."
    
    # Create prompt file
    create_prompt "$original_path" "$improved_path"
    
    # Call Claude with the prompt and original document
    if claude < "${WORK_DIR}/prompt.txt"; then
        print_success "Claude has processed the document"
        
        # Check if improved file was created
        if [ -f "$improved_path" ]; then
            print_success "Improved document created: $improved_path"
            return 0
        else
            print_warning "Improved document not found. Opening Claude for manual improvement..."
            # Open Claude in interactive mode
            claude "$original_path"
            
            # Ask user to confirm when done
            read -p "Press Enter when you've saved the improved document to $improved_path..."
            
            if [ -f "$improved_path" ]; then
                print_success "Improved document found"
                return 0
            else
                print_error "Improved document still not found"
                return 1
            fi
        fi
    else
        print_error "Failed to run Claude"
        return 1
    fi
}

# Function to show diff
show_diff() {
    local original="$1"
    local improved="$2"
    
    print_info "Showing differences..."
    
    if command -v diff &> /dev/null; then
        diff -u "$original" "$improved" | head -50 || true
        echo ""
        read -p "Press Enter to continue..."
    fi
}

# Function to update document
update_document() {
    local doc_id="$1"
    local improved_path="$2"
    
    print_info "Updating document in Outline..."
    
    # Backup before update
    local backup_name="backup-$(date +%Y%m%d_%H%M%S).md"
    cp "$improved_path" "${BACKUP_DIR}/${backup_name}"
    
    # Update document
    if echo "" | oln documents update "$doc_id" -f "$improved_path" --publish; then
        print_success "Document updated successfully!"
        return 0
    else
        print_error "Failed to update document"
        return 1
    fi
}

# Main function
main() {
    echo "==================================="
    echo "🚀 Outline Document Improver"
    echo "==================================="
    echo ""
    
    # Check requirements
    check_requirements
    
    # Get document title from user
    if [ -z "$1" ]; then
        read -p "Enter document title to improve: " DOCUMENT_TITLE
    else
        DOCUMENT_TITLE="$1"
    fi
    
    if [ -z "$DOCUMENT_TITLE" ]; then
        print_error "Document title is required"
        exit 1
    fi
    
    # Setup directories
    setup_directories
    
    # Search for document
    DOC_ID=$(search_document "$DOCUMENT_TITLE")
    if [ $? -ne 0 ] || [ -z "$DOC_ID" ]; then
        print_error "Could not find document"
        exit 1
    fi
    
    print_success "Found document ID: $DOC_ID"
    
    # Export original document
    ORIGINAL_FILE="${ORIGINAL_DIR}/document.md"
    if ! export_document "$DOC_ID" "$ORIGINAL_FILE"; then
        exit 1
    fi
    
    # Improve with Claude
    IMPROVED_FILE="${IMPROVED_DIR}/document.md"
    if ! improve_with_claude "$ORIGINAL_FILE" "$IMPROVED_FILE"; then
        exit 1
    fi
    
    # Show diff
    show_diff "$ORIGINAL_FILE" "$IMPROVED_FILE"
    
    # Confirm update
    echo ""
    print_warning "Ready to update the document in Outline"
    read -p "Do you want to proceed with the update? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if update_document "$DOC_ID" "$IMPROVED_FILE"; then
            print_success "Document improvement completed!"
            print_info "Work directory: $WORK_DIR"
            print_info "Original: $ORIGINAL_FILE"
            print_info "Improved: $IMPROVED_FILE"
            print_info "Backup: ${BACKUP_DIR}/"
        else
            print_error "Update failed"
            exit 1
        fi
    else
        print_warning "Update cancelled"
        print_info "Improved document saved at: $IMPROVED_FILE"
    fi
}

# Run main function
main "$@"