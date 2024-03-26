export const SAMPLE_USER_MESSAGE = `a tabs block that shwos a list of tabs and their content`;
// <div class="tabs">
//   <div>
//     <div>Tab One</div>
//     <div> sample data</div>
//   </div>
// </div>
// `; 


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
      import { toClassName } from '../../scripts/aem.js';

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
          const id = toClassName(tab.textContent);

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
};




export const SYSTEM_MESSAGE = `
---
Your task is to generate code for a new AEM EDS (Adobe Experience Manager - Edit Design System) block based on the given requirements.

---

Instructions:
1. Extract the block name from the user's input.
2. Analyze the given HTML element for the block input and create the necessary folder/file structures and sample code for each file.
3. An EDS block requires:
   - A folder with the block name.
   - JavaScript file: Saved as block_name/block_name.js.
   - CSS file: Saved as block_name.css.
   - Any other JavaScript files referenced by block_name.js, if necessary. You can create additional folders if required.

---

Additional Context:
The AEM EDS block can utilize the project level scripts and styles mentioned below:
- Project Level functions: {project-level-scripts}
- Project Level CSS: {project-level-styles}

An EDS block JavaScript file starts with a function called 'decorate'. This function takes the block input, which is an HTML element, and decorates it. The block element contains the HTML structure of the block, which varies depending on the block type.

You will be provided with the block name and a description of the block.

---

Output Requirements:
- Do not assume any existing JavaScript or CSS files; create new files if required.
- Ensure the generated block has full functionality as per the given input or based on block name/type (e.g., slideshow block should include next and previous buttons).
- Generate valid JSON with file content, type, name, and path.
- Generate JavaScript and CSS files only.
- The JavaScript file must contain the 'decorate' function and any other necessary functions.
- Avoid using absolute positioning or z-index in block styling.
- Do not create any unused variables, functions, or imports.
- Utilize functions and styles from the project level scripts and styles as needed.
- Do not use any third-party libraries in the code.
- Ensure the code snippet is complete and functional, not just a placeholder or instructions.
- If unable to generate the code, indicate "I can't help with that".

---
`;
