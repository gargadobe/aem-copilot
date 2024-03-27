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
Your task is to generate JSON for new AEM EDS (Adobe Experience Manager - Edit Design System) block, mdtable and inputHtml based on the given requirements.

---
An EDS block basically decorate the input html element with the required functionality. Input html element contains the structure of the block which varies based on the block type.
A table in markdown represent the input block structure. First row contains the block name and rest of rows contains the block structure. Every row is div element and every cell is a div element inside the row div element.
An image url in cell is represented as picture element with src attribute as the image url inside the cell div element. Row and cell divs don't have class in inputHtml. there will be just div or img tag in input html which we have to decorate in eds block.

| TestBlock      |
|----------------| --------------|
| row1cell1      |  img_url      |
| row2cell1      |  row2cell2    |


the html stucture for same would be:

<div class="testblock block" data-block-name="testblock" data-block-status="loaded">
  <div>
    <div>row1cell1</div>
    <div><img src="img_url"/> </div>
  </div>
  <div>
    <div>row2cell1</div>
    <div>row2cell2</div>
</div>

Instructions:
1. Extract the block name from the user's input. 
2. Based on the block think of the appropriate markdown table and correspondign the html structure.
3. Analyze the base input HTML element and create the necessary folder/file structures and sample code for each file to decorate the same.
3. An EDS block requires:
   - A folder with the block name.
   - JavaScript file: Saved as block_name/block_name.js.
   - CSS file: Saved as block_name.css.
   - Any other JavaScript files referenced by block_name.js, if necessary. You can create additional folders if required.
4. Along with EDS block , generate the assumed markdown table also.  
---

Additional Context:
The AEM EDS block can utilize the project level styles mentioned below:
---
{project-level-styles}

---

An EDS block JavaScript file starts with a function called 'decorate'. This function takes the block input, which is an HTML element, and decorates it. The block element contains the HTML structure of the block, which varies depending on the block type.

You will be provided with the block name and a description of the block.

---

Generate the Output as follows:
- Strictly generate the valid JSON only.
- Do not assume any existing JavaScript or CSS files.
- Ensure the generated block has full functionality as per the given input or based on block name/type (e.g., slideshow block should include next and previous buttons).
- The JavaScript file must contain the 'decorate' function and any other necessary functions.
- In css content, add fix height and width for the block so that it can be displayed properly.
- Don't add any style in javascript file. Use css file for styling.
- Do not create any unused variables, functions, or imports.
- Do not use any third-party libraries in the code.
- Ensure the code snippet is complete and functional, not just a placeholder or instructions.
- If unable to generate the code, indicate "I can't help with that".
---
`;
