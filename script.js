const canvas = document.getElementById('canvas');
const addTextBtn = document.getElementById('addText');
const deleteTextBtn = document.getElementById('deleteText');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const fontSelect = document.getElementById('fontSelect');
const fontSizeInput = document.getElementById('fontSize');
const boldBtn = document.getElementById('bold');
const italicBtn = document.getElementById('italic');
const underlineBtn = document.getElementById('underline');
const alignLeftBtn = document.getElementById('alignLeft');
const alignCenterBtn = document.getElementById('alignCenter');
const alignRightBtn = document.getElementById('alignRight');
const textColorInput = document.getElementById('textColor');
const bgColorInput = document.getElementById('bgColor');
const exportBtn = document.getElementById('export');
const exportOptions = document.getElementById('exportOptions');
const exportPDFBtn = document.getElementById('exportPDF');
const exportWordBtn = document.getElementById('exportWord');

let history = [];
let redoStack = [];
let currentId = 0;

addTextBtn.addEventListener('click', () => {
    const textElement = document.createElement('div');
    textElement.className = 'text-element';
    textElement.contentEditable = true;
    textElement.id = `text-${currentId++}`;
    textElement.style.left = '10px';
    textElement.style.top = '10px';
    textElement.innerHTML = 'Edit me';
    canvas.appendChild(textElement);
    makeElementDraggable(textElement);
    addToHistory('add', textElement);
    textElement.focus();
});

deleteTextBtn.addEventListener('click', () => {
    const selectedElement = document.querySelector('.text-element.selected');
    if (selectedElement) {
        canvas.removeChild(selectedElement);
        addToHistory('delete', selectedElement);
    }
});

function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.target !== element) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function addToHistory(action, element) {
    history.push({ action, element: element.cloneNode(true) });
    redoStack = [];
}

undoBtn.addEventListener('click', () => {
    if (history.length > 0) {
        const lastAction = history.pop();
        if (lastAction.action === 'add') {
            const element = document.getElementById(lastAction.element.id);
            canvas.removeChild(element);
            redoStack.push(lastAction);
        } else if (lastAction.action === 'delete') {
            canvas.appendChild(lastAction.element);
            makeElementDraggable(lastAction.element);
            redoStack.push(lastAction);
        }
    }
});

redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const action = redoStack.pop();
        if (action.action === 'add') {
            canvas.appendChild(action.element);
            makeElementDraggable(action.element);
            history.push(action);
        } else if (action.action === 'delete') {
            const element = document.getElementById(action.element.id);
            canvas.removeChild(element);
            history.push(action);
        }
    }
});

function applyStyleToSelection(style, value) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style[style] = value;
        range.surroundContents(span);
    }
}

fontSelect.addEventListener('change', (e) => {
    applyStyleToSelection('fontFamily', e.target.value);
});

fontSizeInput.addEventListener('change', (e) => {
    applyStyleToSelection('fontSize', `${e.target.value}px`);
});

boldBtn.addEventListener('click', () => {
    document.execCommand('bold', false, null);
});

italicBtn.addEventListener('click', () => {
    document.execCommand('italic', false, null);
});

underlineBtn.addEventListener('click', () => {
    document.execCommand('underline', false, null);
});

alignLeftBtn.addEventListener('click', () => {
    document.execCommand('justifyLeft', false, null);
});

alignCenterBtn.addEventListener('click', () => {
    document.execCommand('justifyCenter', false, null);
});

alignRightBtn.addEventListener('click', () => {
    document.execCommand('justifyRight', false, null);
});

textColorInput.addEventListener('change', (e) => {
    applyStyleToSelection('color', e.target.value);
});

bgColorInput.addEventListener('change', (e) => {
    applyStyleToSelection('backgroundColor', e.target.value);
});

canvas.addEventListener('click', (e) => {
    document.querySelectorAll('.text-element').forEach(el => el.classList.remove('selected'));
    if (e.target.classList.contains('text-element')) {
        e.target.classList.add('selected');
    }
});

// Export functions
exportBtn.addEventListener('click', () => {
    exportOptions.style.display = exportOptions.style.display === 'block' ? 'none' : 'block';
});

exportPDFBtn.addEventListener('click', () => {
    html2canvas(canvas).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        pdf.addImage(imgData, 'PNG', 0, 0);
        pdf.save("canvas_export.pdf");
    });
    exportOptions.style.display = 'none';
});

exportWordBtn.addEventListener('click', () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header+canvas.innerHTML+footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = 'canvas_export.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
    exportOptions.style.display = 'none';
});

// Close export options when clicking outside
document.addEventListener('click', (e) => {
    if (!exportBtn.contains(e.target) && !exportOptions.contains(e.target)) {
        exportOptions.style.display = 'none';
    }
});

// Adjust text box size based on content
canvas.addEventListener('input', (e) => {
    if (e.target.classList.contains('text-element')) {
        e.target.style.width = 'auto';
        e.target.style.height = 'auto';
        const newWidth = e.target.scrollWidth + 10; // Add some padding
        const newHeight = e.target.scrollHeight + 10;
        e.target.style.width = `${newWidth}px`;
        e.target.style.height = `${newHeight}px`;
    }
});