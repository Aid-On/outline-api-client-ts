#!/bin/bash

# Advanced Outline Document Improvement Script with Claude
# Supports batch processing, templates, and various improvement strategies

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${HOME}/.outline-improver.conf"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
LOG_FILE=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Print functions
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_step() { echo -e "${PURPLE}▶️  $1${NC}"; }

# Logging function
log() {
    if [ -n "$LOG_FILE" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
    fi
}

# Help function
show_help() {
    cat << EOF
Outline Document Improver with Claude - Advanced Version

Usage: $(basename "$0") [OPTIONS] [DOCUMENT_TITLE]

OPTIONS:
    -h, --help              Show this help message
    -c, --collection ID     Process all documents in a collection
    -t, --template NAME     Use a specific improvement template
    -s, --strategy TYPE     Improvement strategy (default: comprehensive)
                           Available: comprehensive, minimal, technical, business
    -b, --batch FILE        Process multiple documents from a file (one title per line)
    -d, --dry-run          Show what would be done without making changes
    -l, --log FILE         Enable logging to file
    -f, --force            Skip confirmation prompts
    -p, --parallel NUM     Process NUM documents in parallel (default: 1)
    --no-backup            Skip creating backups
    --custom-prompt FILE   Use a custom prompt file

EXAMPLES:
    # Improve a single document
    $(basename "$0") "Getting Started Guide"
    
    # Improve all documents in a collection
    $(basename "$0") -c "4b5c8ca0-6b2c-4ad5-b51d-d8d8b37e81fe"
    
    # Use a specific improvement strategy
    $(basename "$0") -s technical "API Documentation"
    
    # Batch process from a file
    $(basename "$0") -b documents.txt
    
    # Process with custom prompt
    $(basename "$0") --custom-prompt my-prompt.txt "My Document"

IMPROVEMENT STRATEGIES:
    comprehensive - Full improvement including structure, content, and formatting
    minimal      - Light touch-ups focusing on clarity and typos
    technical    - Focus on technical accuracy and code examples
    business     - Focus on business value and clarity for non-technical readers

EOF
}

# Load configuration
load_config() {
    if [ -f "$CONFIG_FILE" ]; then
        source "$CONFIG_FILE"
    fi
}

# Save configuration
save_config() {
    cat > "$CONFIG_FILE" << EOF
# Outline Document Improver Configuration
DEFAULT_STRATEGY="${STRATEGY:-comprehensive}"
DEFAULT_PARALLEL="${PARALLEL:-1}"
KEEP_BACKUPS="${KEEP_BACKUPS:-true}"
EOF
}

# Check requirements
check_requirements() {
    local missing=()
    
    for cmd in oln claude jq; do
        if ! command -v "$cmd" &> /dev/null; then
            missing+=("$cmd")
        fi
    done
    
    if [ ${#missing[@]} -ne 0 ]; then
        print_error "Missing required commands: ${missing[*]}"
        echo "Installation instructions:"
        [ " ${missing[*]} " =~ " oln " ] && echo "  oln: npm install -g @aid-on-libs/outline-api-client"
        [ " ${missing[*]} " =~ " claude " ] && echo "  claude: Visit https://claude.ai/download"
        [ " ${missing[*]} " =~ " jq " ] && echo "  jq: brew install jq (macOS) or apt-get install jq (Linux)"
        exit 1
    fi
}

# Create improvement prompt based on strategy
create_improvement_prompt() {
    local strategy="$1"
    local doc_path="$2"
    local improved_path="$3"
    local prompt_file="$4"
    
    case "$strategy" in
        minimal)
            cat > "$prompt_file" << 'EOF'
Please make minimal improvements to this Outline document:
- Fix typos and grammatical errors
- Improve clarity of existing content
- Ensure consistent formatting
- Keep changes minimal and preserve the original structure

Do not add new sections or significantly expand content.
EOF
            ;;
            
        technical)
            cat > "$prompt_file" << 'EOF'
Please improve this technical Outline document with focus on:
- Technical accuracy and precision
- Code examples and implementation details
- API references and specifications
- Performance considerations
- Security best practices
- Troubleshooting sections
- Technical prerequisites and dependencies

Ensure all technical information is current and accurate.
EOF
            ;;
            
        business)
            cat > "$prompt_file" << 'EOF'
Please improve this Outline document for business audiences:
- Focus on business value and ROI
- Use clear, non-technical language
- Add executive summaries where appropriate
- Include use cases and success stories
- Highlight benefits and outcomes
- Remove or simplify technical jargon
- Add visual representations (tables, lists)

Make it accessible to non-technical stakeholders.
EOF
            ;;
            
        comprehensive|*)
            cat > "$prompt_file" << 'EOF'
Please comprehensively improve this Outline document:

1. Structure Optimization
   - Organize with clear hierarchy
   - Ensure logical flow
   - Remove redundancy
   - Add table of contents if appropriate

2. Content Enhancement
   - Fill information gaps
   - Add practical examples
   - Include best practices
   - Update outdated information
   - Add relevant links and references

3. Readability Improvements
   - Use tables for structured data
   - Add bullet points and lists
   - Include visual elements (emoji icons)
   - Highlight important information
   - Break up long paragraphs

4. Search Optimization
   - Include relevant keywords
   - Suggest tags (#tag format)
   - Add internal links [[Document Name]]
   - Use clear, searchable titles

5. Modern Features
   - Add slash commands examples
   - Include API/CLI usage where relevant
   - Mention integrations
   - Add collaborative features

Keep the Markdown format and ensure compatibility with Outline's features.
EOF
            ;;
    esac
    
    echo "" >> "$prompt_file"
    echo "Save the improved document to: $improved_path" >> "$prompt_file"
    echo "" >> "$prompt_file"
    echo "Original document: $doc_path" >> "$prompt_file"
}

# Get all documents in a collection
get_collection_documents() {
    local collection_id="$1"
    
    print_info "Fetching documents from collection: $collection_id"
    
    oln documents list --collection "$collection_id" | grep "ID:" | awk '{print $2}' || true
}

# Process a single document
process_document() {
    local title_or_id="$1"
    local work_dir="$2"
    local strategy="${3:-comprehensive}"
    local custom_prompt="$4"
    
    print_step "Processing: $title_or_id"
    log "Processing document: $title_or_id"
    
    # Create subdirectories
    mkdir -p "$work_dir/original" "$work_dir/improved" "$work_dir/backup"
    
    # Determine if input is ID or title
    local doc_id=""
    if [[ "$title_or_id" =~ ^[a-f0-9-]{36}$ ]]; then
        doc_id="$title_or_id"
    else
        # Search for document
        local search_result=$(oln documents search "$title_or_id" 2>/dev/null || true)
        doc_id=$(echo "$search_result" | grep -oE 'ID: [a-f0-9-]+' | head -1 | cut -d' ' -f2)
    fi
    
    if [ -z "$doc_id" ]; then
        print_error "Document not found: $title_or_id"
        log "ERROR: Document not found: $title_or_id"
        return 1
    fi
    
    # Export document
    local original_file="$work_dir/original/${doc_id}.md"
    if ! oln documents export "$doc_id" -o "$original_file" 2>/dev/null; then
        print_error "Failed to export document: $doc_id"
        log "ERROR: Failed to export document: $doc_id"
        return 1
    fi
    
    # Extract title from document
    local doc_title=$(head -n 1 "$original_file" | sed 's/^# //')
    print_info "Document: $doc_title (ID: $doc_id)"
    
    # Create improved version
    local improved_file="$work_dir/improved/${doc_id}.md"
    local prompt_file="$work_dir/prompt-${doc_id}.txt"
    
    if [ -n "$custom_prompt" ] && [ -f "$custom_prompt" ]; then
        cp "$custom_prompt" "$prompt_file"
        echo "" >> "$prompt_file"
        echo "Save to: $improved_file" >> "$prompt_file"
        echo "Original: $original_file" >> "$prompt_file"
    else
        create_improvement_prompt "$strategy" "$original_file" "$improved_file" "$prompt_file"
    fi
    
    # Improve with Claude
    print_info "Improving with Claude (strategy: $strategy)..."
    
    # Create a combined input file
    local combined_input="$work_dir/combined-${doc_id}.txt"
    cat "$prompt_file" > "$combined_input"
    echo -e "\n--- ORIGINAL DOCUMENT ---\n" >> "$combined_input"
    cat "$original_file" >> "$combined_input"
    
    # Call Claude
    if claude "$original_file" "Please improve this document according to the $strategy strategy and save the result."; then
        print_success "Claude processing complete"
    else
        print_error "Claude processing failed"
        log "ERROR: Claude processing failed for $doc_id"
        return 1
    fi
    
    # Verify improved file exists
    if [ ! -f "$improved_file" ]; then
        print_warning "Improved file not created automatically"
        
        # Try alternative approach
        print_info "Please manually create the improved version at: $improved_file"
        read -p "Press Enter when ready..."
        
        if [ ! -f "$improved_file" ]; then
            print_error "Improved file still missing"
            return 1
        fi
    fi
    
    # Show diff summary
    if command -v wc &> /dev/null; then
        local orig_lines=$(wc -l < "$original_file")
        local impr_lines=$(wc -l < "$improved_file")
        print_info "Document size: $orig_lines lines → $impr_lines lines"
    fi
    
    # Update document (if not dry-run)
    if [ "$DRY_RUN" != "true" ]; then
        if [ "$FORCE" == "true" ] || confirm_update "$doc_title"; then
            # Backup
            if [ "$NO_BACKUP" != "true" ]; then
                local backup_file="$work_dir/backup/${doc_id}-$(date +%Y%m%d_%H%M%S).md"
                cp "$original_file" "$backup_file"
            fi
            
            # Update
            if echo "" | oln documents update "$doc_id" -f "$improved_file" --publish 2>/dev/null; then
                print_success "Updated: $doc_title"
                log "SUCCESS: Updated document $doc_id"
                return 0
            else
                print_error "Failed to update: $doc_title"
                log "ERROR: Failed to update document $doc_id"
                return 1
            fi
        else
            print_warning "Skipped: $doc_title"
            log "SKIPPED: Document $doc_id"
        fi
    else
        print_info "Dry-run: Would update $doc_title"
        log "DRY-RUN: Would update document $doc_id"
    fi
}

# Confirm update
confirm_update() {
    local title="$1"
    
    if [ "$FORCE" == "true" ]; then
        return 0
    fi
    
    read -p "Update '$title'? (y/N): " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# Process multiple documents
process_batch() {
    local file="$1"
    local work_dir="$2"
    
    if [ ! -f "$file" ]; then
        print_error "Batch file not found: $file"
        return 1
    fi
    
    local total=$(wc -l < "$file")
    local current=0
    local success=0
    local failed=0
    
    print_info "Processing $total documents from batch file"
    
    while IFS= read -r title; do
        [ -z "$title" ] && continue
        ((current++))
        
        echo ""
        print_step "[$current/$total] $title"
        
        if process_document "$title" "$work_dir" "$STRATEGY" "$CUSTOM_PROMPT"; then
            ((success++))
        else
            ((failed++))
        fi
    done < "$file"
    
    echo ""
    print_info "Batch processing complete"
    print_success "Successful: $success"
    [ $failed -gt 0 ] && print_error "Failed: $failed"
}

# Main function
main() {
    # Default values
    STRATEGY="comprehensive"
    PARALLEL=1
    DRY_RUN=false
    FORCE=false
    NO_BACKUP=false
    COLLECTION_ID=""
    BATCH_FILE=""
    CUSTOM_PROMPT=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -c|--collection)
                COLLECTION_ID="$2"
                shift 2
                ;;
            -t|--template)
                TEMPLATE="$2"
                shift 2
                ;;
            -s|--strategy)
                STRATEGY="$2"
                shift 2
                ;;
            -b|--batch)
                BATCH_FILE="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -l|--log)
                LOG_FILE="$2"
                shift 2
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -p|--parallel)
                PARALLEL="$2"
                shift 2
                ;;
            --no-backup)
                NO_BACKUP=true
                shift
                ;;
            --custom-prompt)
                CUSTOM_PROMPT="$2"
                shift 2
                ;;
            *)
                DOCUMENT_TITLE="$1"
                shift
                ;;
        esac
    done
    
    # Check requirements
    check_requirements
    
    # Load configuration
    load_config
    
    # Setup work directory
    WORK_DIR="outline-improve-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$WORK_DIR"
    
    # Initialize log
    if [ -n "$LOG_FILE" ]; then
        log "Starting Outline Document Improver"
        log "Strategy: $STRATEGY"
        log "Work directory: $WORK_DIR"
    fi
    
    echo "========================================"
    echo "🚀 Outline Document Improver - Advanced"
    echo "========================================"
    echo ""
    print_info "Strategy: $STRATEGY"
    print_info "Work directory: $WORK_DIR"
    [ "$DRY_RUN" == "true" ] && print_warning "DRY-RUN MODE - No changes will be made"
    echo ""
    
    # Process based on mode
    if [ -n "$COLLECTION_ID" ]; then
        # Process entire collection
        print_step "Processing collection: $COLLECTION_ID"
        
        # Get all documents in collection
        mapfile -t doc_ids < <(get_collection_documents "$COLLECTION_ID")
        
        if [ ${#doc_ids[@]} -eq 0 ]; then
            print_error "No documents found in collection"
            exit 1
        fi
        
        print_info "Found ${#doc_ids[@]} documents"
        
        for doc_id in "${doc_ids[@]}"; do
            echo ""
            process_document "$doc_id" "$WORK_DIR" "$STRATEGY" "$CUSTOM_PROMPT"
        done
        
    elif [ -n "$BATCH_FILE" ]; then
        # Process batch file
        process_batch "$BATCH_FILE" "$WORK_DIR"
        
    elif [ -n "$DOCUMENT_TITLE" ]; then
        # Process single document
        process_document "$DOCUMENT_TITLE" "$WORK_DIR" "$STRATEGY" "$CUSTOM_PROMPT"
        
    else
        # Interactive mode
        read -p "Enter document title: " DOCUMENT_TITLE
        if [ -n "$DOCUMENT_TITLE" ]; then
            process_document "$DOCUMENT_TITLE" "$WORK_DIR" "$STRATEGY" "$CUSTOM_PROMPT"
        else
            print_error "No document specified"
            exit 1
        fi
    fi
    
    # Summary
    echo ""
    print_success "Processing complete!"
    print_info "Work directory: $WORK_DIR"
    
    # Save configuration
    save_config
    
    # Close log
    log "Processing complete"
}

# Run main function
main "$@"