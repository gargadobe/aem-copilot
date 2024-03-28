export const SAMPLE_USER_MESSAGE = `a tabs block that show a list of tabs and their content`;

export const SAMPLE_ASSISTANT_OUTPUT = {
  tree: {
    name: "tabs",
    type: "directory",
    children: [
      {
        name: "tabs.js",
        type: "file",
      },
      {
        name: "tabs.css",
        type: "file",
      },
    ],
  },
  files: [
    {
      type: "javascript",
      path: "blocks/tabs/tabs.js",
      content: `
      // eslint-disable-next-line import/no-unresolved

      function hasWrapper(el) {
        return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
      }

      export default async function decorate(block) {
        // build tablist
        const tablist = document.createElement('div');
        tablist.className = 'tabs-list';
        tablist.setAttribute('role', 'tablist');

        // decorate tabs and tabpanels
        const tabs = [...block.children].map((child) => child.firstElementChild);
        tabs.forEach((tab, i) => {
          const id = "tab-" + i;

          // decorate tabpanel
          const tabpanel = block.children[i];
          tabpanel.className = 'tabs-panel';
          tabpanel.id = \`tabpanel-\${id}\`;
          tabpanel.setAttribute('aria-hidden', !!i);
          tabpanel.setAttribute('aria-labelledby', \`tab-\${id}\`);
          tabpanel.setAttribute('role', 'tabpanel');
          if (!hasWrapper(tabpanel.lastElementChild)) {
            tabpanel.lastElementChild.innerHTML = \`<p>\${tabpanel.lastElementChild.innerHTML}</p>\`;
          }

          // build tab button
          const button = document.createElement('button');
          button.className = 'tabs-tab';
          button.id = \`tab-\${id}\`;
          button.innerHTML = tab.innerHTML;
          button.setAttribute('aria-controls', \`tabpanel-\${id}\`);
          button.setAttribute('aria-selected', !i);
          button.setAttribute('role', 'tab');
          button.setAttribute('type', 'button');
          button.addEventListener('click', () => {
            block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
              panel.setAttribute('aria-hidden', true);
            });
            tablist.querySelectorAll('button').forEach((btn) => {
              btn.setAttribute('aria-selected', false);
            });
            tabpanel.setAttribute('aria-hidden', false);
            button.setAttribute('aria-selected', true);
          });
          tablist.append(button);
          tab.remove();
        });

        block.prepend(tablist);
      }
    `,
      name: "tabs.js",
    },
    {
      type: "css",
      path: "blocks/tabs/tabs.css",
      content: `
      .tabs .tabs-list {
        display: flex;
        gap: 8px;
        max-width: 100%;
        overflow-x: auto;
      }

      .tabs .tabs-list button {
        flex: 0 0 max-content;
        margin: 0;
        border: 1px solid var(--dark-color);
        border-radius: 0;
        padding: 8px 16px;
        background-color: var(--light-color);
        color: initial;
        font-size: unset;
        font-weight: bold;
        line-height: unset;
        text-align: initial;
        text-overflow: unset;
        overflow: unset;
        white-space: unset;
        transition: background-color 0.2s;
      }

      .tabs .tabs-list button[aria-selected="true"] {
        border-bottom: 1px solid var(--background-color);
        background-color: var(--background-color);
        cursor: initial;
      }

      .tabs .tabs-list button[aria-selected="false"]:hover,
      .tabs .tabs-list button[aria-selected="false"]:focus {
        background-color: var(--dark-color);
      }

      .tabs .tabs-panel {
        margin-top: -1px;
        padding: 0 16px;
        border: 1px solid var(--dark-color);
        overflow: auto;
      }

      .tabs .tabs-panel[aria-hidden="true"] {
        display: none;
      }
    `,
      name: "tabs.css",
    },
  ],
  mdtable: `
| Tabs       |              |
|----------- |--------------|
| Tab One    | tab one text | 
| Tab Two    | tab two text |
`,
  inputHtml: `
<div class="tabs block" data-block-name="tabs" data-block-status="loaded">
  <div>
    <div>Tab One</div>
    <div>tab one text</div>
  </div>
  <div>
    <div>Tab Two</div>
    <div>tab two text</div>
  </div>
</div>
  `
};

export const SYSTEM_MESSAGE = `
---
Your task is to generate JSON for a new AEM EDS (Adobe Experience Manager - Edit Design System) block, including JavaScript and CSS files, a markdown table representation, and sample input HTML based on the provided requirements.

---

**Requirements:**

1. **Extract Block Name**: Extract the block name from the user's input.
2. **Generate Markdown Table**: Based on the block, create an appropriate markdown table representation.
   - The markdown table should reflect the structure of the block, with each row representing a component or element within the block.
   - For example, if the block consists of tabs, the markdown table should list the tabs and their corresponding content.

3. **Create Input HTML Structure**:
   - Analyze the base input HTML element and generate the necessary structure to represent the block.
   - Only divs and img tags should be used to represent the block structure. Strictly follow the input HTML structure.
   - Each row in the markdown table corresponds to a \`<div>\` element in the input HTML.
   - Elements within each row (cells) should be represented as nested \`<div>\` elements or \`<img>\` tags, reflecting the content and structure of the block.
   - Internal elements within the block must not have any classes, IDs, or other properties.

4. **Create Folder/File Structures**: 
   - Based on the extracted block name and the input HTML structure, generate the necessary folder/file structures and sample code for each file to decorate the block.
   - A folder should be created with the block name.
   - JavaScript file: Saved as block_name/block_name.js.
   - CSS file: Saved as block_name.css.
   - Any other JavaScript files referenced by block_name.js, if necessary. Additional folders can be created if required.

5. **Functionality of EDS Block**:
   - Ensure the generated block has full functionality as per the given input or based on the block name/type. For example, a slideshow block should include next and previous buttons.

6. **CSS Styling**:
   - In the CSS content, add fixed height and width for the block to ensure proper display. Do not add any style in the JavaScript file; use the CSS file for styling.

7. **Project-Level Styles**:
   - The AEM EDS block can utilize project-level styles mentioned below:
     {project-level-styles}

8. **JavaScript Functionality**:
   - An EDS block JavaScript file must start with a function called 'decorate'. This function takes the block input, which is an HTML element, and decorates it. The block element contains the HTML structure of the block, which varies depending on the block type.
   - Decorate method decorates the input html with full fledged functionality as per the block type.

**Output Format**:
- Generate valid JSON only.
- Ensure the generated code snippet is complete and functional, not just a placeholder or instructions.
- If unable to generate the code, indicate "I can't help with that".

**Note**:
- The internal \`<div>\` elements within the block should not have any classes, IDs, or other properties. Only the outermost block element will have the specific classes and attributes.
- Use decorate method to add classes or id for styling or functionality.
- Only divs and img tags should be used to represent the block structure. Strictly follow the input HTML structure.
- Don't use /* add your styles here */ in the css file or in javscript file. Generate the full code.
---
`;
