# Gift PDF Files Structure

## Overview

This directory contains PDF gift files that are sent to users who complete the AI Readiness Test, based on their readiness score.

## Directory Structure

```
gifts/
├── hot/                    # For scores 75-100 (HOT leads)
│   ├── ai-strategy-professional.pdf
│   └── ai-tools-checklist-100.pdf
├── warm/                   # For scores 55-74 (WARM leads)
│   └── ai-tools-50-productivity.pdf
└── cold/                   # For scores 0-54 (COLD leads)
    └── ai-first-steps-guide.pdf
```

## File Requirements

### Naming Convention
- **Format**: lowercase
- **Separators**: use hyphens (`-`) instead of spaces
- **Extension**: `.pdf`
- **Examples**:
  - ✅ `ai-strategy-professional.pdf`
  - ❌ `AI Strategy Professional.pdf`
  - ❌ `ai_strategy_professional.pdf`

### File Specifications
- **Format**: PDF
- **Max size**: 10 MB per file (Resend API limit)
- **Encoding**: UTF-8 (for Cyrillic metadata)
- **Compression**: Recommended for better email delivery

### Accessibility
Files must be accessible via URL:
```
https://www.expertai.academy/gifts/hot/ai-strategy-professional.pdf
https://www.expertai.academy/gifts/warm/ai-tools-50-productivity.pdf
https://www.expertai.academy/gifts/cold/ai-first-steps-guide.pdf
```

## Gift Content by Category

### HOT Leads (75-100 points)
**Profile**: Expert/Professional users with high AI readiness

**Files to provide**:
1. `ai-strategy-professional.pdf` - Advanced AI strategy guide
2. `ai-tools-checklist-100.pdf` - Comprehensive list of 100 AI tools

**Additional materials** (mentioned in email but not attached):
- Promo code for consultation: EXPERT30
- Access to private community
- Prompt templates for their profession

### WARM Leads (55-74 points)
**Profile**: Active users ready to implement AI

**Files to provide**:
1. `ai-tools-50-productivity.pdf` - 50 AI tools for productivity

**Additional materials** (mentioned in email but not attached):
- Video guide: "How to choose your first AI tool"
- Access to Telegram community
- Automation templates

### COLD Leads (0-54 points)
**Profile**: Beginners with low AI readiness

**Files to provide**:
1. `ai-first-steps-guide.pdf` - Getting started guide

**Additional materials** (mentioned in email but not attached):
- 30-day learning plan
- 10 simple AI tools for beginners
- Video: "ChatGPT basics"

## Creating PDF Files

### Recommended Tools
- **Canva**: https://www.canva.com (easy design)
- **Adobe InDesign**: Professional layout
- **Google Docs**: Export to PDF
- **Figma**: Design and export

### Content Guidelines
1. **Branding**: Include your logo and brand colors
2. **Language**: Russian (target audience)
3. **Layout**: Professional, readable fonts
4. **Images**: High quality, compressed
5. **Interactive**: Consider adding clickable links
6. **Footer**: Include contact information and social media

### Compression
Before uploading, compress PDFs to reduce file size:
- Online: https://www.ilovepdf.com/compress_pdf
- Mac: Preview → Export → Reduce File Size
- Linux: `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf`

## Updating Files

### When to update
- Content becomes outdated
- New tools/strategies emerge
- User feedback suggests improvements
- Seasonal updates

### Update process
1. Create new version with updated content
2. Test file size and accessibility
3. Replace old file in directory
4. Clear Vercel cache if needed:
   ```bash
   # Files are cached for 1 year, may need redeployment
   vercel --prod
   ```

## Testing

### Local testing
```bash
# Check file exists
ls -lh public/gifts/hot/ai-strategy-professional.pdf

# Check file size
du -h public/gifts/hot/ai-strategy-professional.pdf
```

### Production testing
```bash
# Check accessibility
curl -I https://www.expertai.academy/gifts/hot/ai-strategy-professional.pdf

# Should return:
# HTTP/2 200
# content-type: application/pdf
```

### Email testing
1. Send test email via `/api/send-gift`
2. Verify PDFs are attached
3. Check file opens correctly
4. Verify email doesn't go to spam

## Security & Access Control

### Current setup
- Files are **publicly accessible** via URL
- No authentication required
- Anyone with URL can download

### Future enhancements (optional)
- Add authentication/token-based access
- Track downloads per user
- Expire links after certain period
- Use signed URLs for temporary access

## Backup

### Recommended backup strategy
1. **Git repository**: Commit PDF files to repo (if < 100MB)
2. **Cloud storage**: Keep master copies in Google Drive/Dropbox
3. **Version control**: Name files with dates for versioning
   - Example: `ai-strategy-professional-2024-10.pdf`

## Monitoring

### Metrics to track
- Download count (via Vercel Analytics)
- Email delivery rate (via Resend Dashboard)
- User engagement (survey after download)

### Vercel Analytics
```bash
# In Vercel Dashboard:
Analytics → Top Pages → /gifts/
```

## Troubleshooting

### File not accessible
```bash
# 1. Check file exists in correct location
ls -la public/gifts/hot/

# 2. Check deployment includes file
# Vercel Dashboard → Deployments → Source Files

# 3. Verify URL is correct
curl https://www.expertai.academy/gifts/hot/ai-strategy-professional.pdf
```

### File too large
```bash
# Check size
ls -lh public/gifts/hot/ai-strategy-professional.pdf

# If > 10MB, compress:
# Use online tool or command line
```

### Email attachment fails
1. Check Resend logs for error message
2. Verify file URL is publicly accessible
3. Check file size < 10MB
4. Test URL directly in browser

## Support

For questions or issues:
- Check `/GIFT_EMAIL_SETUP.md` for full setup guide
- Vercel Docs: https://vercel.com/docs/concepts/projects/overview
- Resend Docs: https://resend.com/docs/send-with-attachments
