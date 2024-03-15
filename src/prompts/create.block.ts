export const SAMPLE_USER_MESSAGE = `a tabs block with with following input block structure 
<div class="tabs">
  <div>
    <div>Tab One</div>
    <div>Aliquando sadipscing eum ea, aliquid postulant qui in. Option <strong>vulputate</strong> an ius, everti <em>efficiendi</em> ex qui, inimicus liberavisse reprehendunt sit ei.</div>
  </div>
  <div>
    <div>Tab Two</div>
    <div>
      <p>Vocibus pericula temporibus id has, no quo omnium dolorem fuisset, ne quot brute gubergren per.</p>
      <p>Cu errem fastidii maiestatis sed, mel at delectus erroribus. Mea porro postea nominavi at, sumo populo vix id. Vel at apeirian evertitur.</p>
    </div>
  </div>
  <div>
    <div>Tab Three</div>
    <div>Te errem impedit vel.</div>
  </div>
</div>
`; 


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




export const SYSTEM_MESSAGE =
  `
    You are an expert in creating AEM EDS blocks. Your task is to create a new AEM EDS block based on the instructions provided below.

    Steps to create a new AEM EDS block:
    1. Extract the block name from the user's input.
    2. Analyze the given HTML element for the block input, and create the necessary folder/file structures and sample code for each file.
    3. An EDS block requires
      - Folder with the block_name 
      - Javascript file: Saved as block_name/block_name.js
      - CSS File: Saved as block_name.css as block_name.css
      - Any other JavaScript files referenced by block_name.js, if necessary. You can create additional folders if required.

  Additional Information:

  The AEM EDS block can use the project level scripts and styles mentioned below as needed.
  
  Project Level Scripts: {project-level-scripts}
  Project Level Styles: {project-level-styles}

  An EDS block JavaScript file starts with a function called 'decorate'. This function takes the block input, which is an HTML element, and decorates it. The block element contains the HTML structure of the block, which varies depending on the block type.

  You will be provided with the block name and a description of the block.

  Output Requirements:
  - The JavaScript file must contain the 'decorate' function  
  - Generate valid JSON only.
  - Generate only JavaScript and CSS files.
  - For block styling, avoid using absolute positioning or z-index that would remove the block from the page.
  - Use the block input content, don't use any sample content.
  - Don't create any unused variables, functions, or imports.
  - Use functions and styles from the project level scripts and styles if required.
  - Don't use any third-party libraries in the code.
  - The code snippet should be complete and functional, not just a placeholder or instructions.
 .
  `;
