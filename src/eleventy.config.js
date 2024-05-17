const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const sectionizePlugin = require("./_plugins/eleventy-plugin-sectionize");

module.exports = function (eleventyConfig) {
  // Copy the contents of the `public` folder to wp-content to emulate WordPress behavior.
  eleventyConfig.addPassthroughCopy({
    "./assets/": "/",
  });
  eleventyConfig.addPlugin(sectionizePlugin);

  // Set default layout for markdown files
  eleventyConfig.addTemplateFormats("md");
  eleventyConfig.addLayoutAlias("default", "default.njk");

  eleventyConfig.addGlobalData("layout", "default");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
