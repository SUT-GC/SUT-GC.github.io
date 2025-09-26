# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based blog site for SutGC's Blog. The site is configured with Chinese language support and includes a custom theme with home and blog layouts.

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Serve the site locally for development
bundle exec jekyll serve

# Build the site
bundle exec jekyll build
```

### Testing and Linting
No specific test or lint commands are configured. The project relies on Jekyll's built-in validation.

## Architecture

### Jekyll Structure
- **_config.yml**: Main Jekyll configuration with site metadata, plugins, and custom paths
- **_layouts/**: HTML templates for different page types
  - `home.html`: Landing page with animated bio section
  - `blog.html`: Main blog layout with header/footer structure
  - `post.html`: Individual blog post layout
  - `page.html`: Static page layout
- **_includes/**: Reusable HTML components organized by section (common/, blog/, home/)
- **_posts/**: Blog posts in Markdown format with YAML front matter
- **_sass/**: SCSS stylesheets for styling
- **assets/**: Static assets including stylesheets and images

### Content Structure
- Posts follow Jekyll naming convention: `YYYY-MM-DD-title.md`
- Posts use YAML front matter with layout, title, description, categories, and tags
- Categories and tags are used for content organization
- Kramdown TOC is used for post navigation: `{:toc .toc}`

### Site Configuration
- Language: Chinese (zh)
- Permalink structure: `/blog/:year/:month/:day/:title/`
- Plugins: jekyll-feed, jekyll-redirect-from, jekyll-seo-tag, jekyll-sitemap
- Markdown processor: Kramdown with smart quotes and heading prefixes

### Key Paths
- Home: `/`
- Blog: `/blog/`
- Categories: `/blog/categories/`
- Tags: `/blog/tags/`
- About: `/blog/about/`
- Files: `/files/powerpoint/` and `/files/images/`

## Content Creation

### Adding Blog Posts
1. Create new file in `_posts/` following naming convention
2. Include required front matter:
   ```yaml
   ---
   layout: post
   title: "Post Title"
   description: "Post description"
   categories: [category]
   tags: [tag1, tag2]
   ---
   ```
3. Add TOC if needed: `{:toc .toc}`
4. Write content in Markdown

### Customizing Appearance
- Modify `_config.yml` for site-wide settings
- Edit layouts in `_layouts/` for page structure
- Update SCSS in `_sass/` for styling
- Modify includes in `_includes/` for reusable components