const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItAttrs = require("markdown-it-attrs");

module.exports = function(eleventyConfig) {
  const md = markdownIt()
    .use(markdownItAnchor, {
      permalink: false,
      slugify: s => s.toLowerCase().replace(/[^\w]+/g, '-')
    })
    .use(markdownItAttrs);

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

  eleventyConfig.setLibrary("md", md);
};
