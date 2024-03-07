const SAMPLE_EDS_BLOCK = "\
-column.js:\
```javascript\
export default function decorate(block) {\
    const cols = [...block.firstElementChild.children];\
    block.classList.add(`columns-${cols.length}-cols`); \
  \
    // setup image columns\
    [...block.children].forEach((row) => {\
      [...row.children].forEach((col) => {\
        const pic = col.querySelector('picture');\
        if (pic) { \
          const picWrapper = pic.closest('div');\
          if (picWrapper && picWrapper.children.length === 1) { \
            // picture is only content in column \
            picWrapper.classList.add('columns-img-col');\
          } \
        } \
      }); \
    }); \
  } \
```\
- column.css:\
```css\
.columns > div { \
    display: flex; \
    flex-direction: column; \
  } \
 \
  .columns img { \
    width: 100%; \
  } \
 \
  .columns > div > .columns-img-col img { \
    display: block; \
  } \
 ";

 const EDS_BLOCK_JSON_STRING  = " \
 [ \
  { \
    \"type\": \"css\", \
    \"name\": \"column.css\", \
    \"path\": \"src/blocks/column/column.css\", \
    \"content\": \".columns > div { display: flex; flex-direction: column; } .columns img { width: 100%; } .columns > div >  .columns-img-col img { display: block; }\" \
  { \
    \"type\": \"js\", \
    \"name\": \"column.js\", \
    \"path\": \"src/blocks/column/column.js\", \
    \"content\": \"export default function decorate(block) { const cols = [...block.firstElementChild.children];  \ block.classList.add(`columns-${cols.length}-cols`); // setup image columns [...block.children].forEach((row) => { \ [...row.children].forEach((col) => { const pic = col.querySelector('picture'); if (pic) { const picWrapper =  \ pic.closest('div'); if (picWrapper && picWrapper.children.length === 1) { // picture is only content in column \ picWrapper.classList.add('columns-img-col'); } } }); }); }\" \
  } \
  ] \
 ";
      


export const CREATE_SYSTEM_MESSAGE = "\
    You are an expert on AEM EDS blocks. You are tasked with generating a new AEM EDS block.\
    you need to first extract the block name from the user's input.\
    A EDS block requires following files to be generated along with sample code:\
        - create a folder with the block_name\
        - Javascript file: Saved as block_name/block_name.js\
        - CSS File: Saved as block_name.css\
        - Other Javascript file: other js files referenced by block_name.js if necessary. can create other necessary folders if required\
    A EDS block js start with a function called decorate that basically take block input, block is an HTML element, and then decorate it.\
    block element basically contains the HTML structure of the block depening on the block type.\
    so given the block name and its input details(as per requirement), you need to generate the folder/file structures and sample code for each files.\
    \
  ---\
     Example:" + SAMPLE_EDS_BLOCK + "\
    ->->->->->->: \
    " + EDS_BLOCK_JSON_STRING + "\
    ---\
    You will be provided with the following :\
        - block name and some description about block\
    Strictly generate the folder/file structures and show in tree view along sample code for each files as the given sample code.\
    the code snippet should contain some code rather than just a placeholder and instructions.\
    Also generate valid json string of same and add ->->->->->-> prefix to that \
    don't generate anything statign you are generating json string.\
    json output should be valid and should contain valid path , not any placeholder path lies /path/to/... etc.";


   

