const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");
const fs = require('fs');
const matter = require('gray-matter');

const isDevelopment = process.env.NODE_ENV === 'development';

function configureMarkdown(permalinksEnabled = false) {
  const md = markdownIt({ html: true }).use(markdownItAttrs);

  if (permalinksEnabled) {
    md.use(markdownItAnchor, {
      permalink: true,
      permalinkClass: 'header-anchor',
      permalinkSymbol: '🔗',
      permalinkBefore: true,
      slugify: s => s.toLowerCase().replace(/[^\w]+/g, '-')
    });
  }

  function wrapSections(tokens) {
    let result = [];
    let stack = [];
    let lastLevel = 0;

    tokens.forEach(token => {
      if (token.type === 'heading_open') {
        let level = parseInt(token.tag.slice(1));

        while (stack.length && lastLevel >= level) {
          result.push(stack.pop());
          lastLevel--;
        }

        result.push({ type: 'html_block', content: '<section>' });
        stack.push({ type: 'html_block', content: '</section>' });
        lastLevel = level;
      }
      result.push(token);
    });

    while (stack.length) {
      result.push(stack.pop());
    }

    return result;
  }

  md.core.ruler.push('wrap_sections', state => {
    state.tokens = wrapSections(state.tokens);
  });

  return md;
}

module.exports = function(eleventyConfig) {
  eleventyConfig.setLibrary("md", configureMarkdown());

  eleventyConfig.addFilter("markdown", function(content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }

    const inputPath = this.page.inputPath;
    const fileContent = fs.readFileSync(inputPath, 'utf8');
    const data = matter(fileContent).data;
    const permalinksEnabled = data.permalinks !== undefined ? data.permalinks : false;

    const md = configureMarkdown(permalinksEnabled);
    return md.render(content);
  });
};
