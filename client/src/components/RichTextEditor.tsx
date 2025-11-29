import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "data-testid"?: string;
}

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    ['link'],
    [{ 'header': [2, 3, false] }],
    [{ 'align': [] }],
    ['blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['clean'],
  ],
};

const formats = [
  'bold', 'italic', 'underline', 'strike',
  'script',
  'link',
  'header',
  'align',
  'blockquote',
  'list', 'bullet', 'indent',
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className = "",
  "data-testid": testId,
}: RichTextEditorProps) {
  return (
    <div className={`rich-text-editor ${className}`} data-testid={testId}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 100px;
          font-size: 14px;
          font-family: inherit;
        }
        
        .rich-text-editor .ql-editor {
          min-height: 80px;
        }
        
        .rich-text-editor .ql-toolbar.ql-snow {
          border: 1px solid hsl(var(--border));
          border-radius: 6px 6px 0 0;
          background: hsl(var(--card));
        }
        
        .rich-text-editor .ql-container.ql-snow {
          border: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 6px 6px;
          background: hsl(var(--background));
        }
        
        .rich-text-editor .ql-editor {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
        
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-picker {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-toolbar .ql-picker-options {
          background: hsl(var(--popover));
          border-color: hsl(var(--border));
        }
        
        .rich-text-editor .ql-toolbar .ql-picker-item:hover,
        .rich-text-editor .ql-toolbar .ql-picker-item.ql-selected {
          color: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-toolbar button:hover .ql-fill,
        .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-toolbar button:hover,
        .rich-text-editor .ql-toolbar button.ql-active {
          color: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-snow .ql-tooltip {
          background: hsl(var(--popover));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .rich-text-editor .ql-snow .ql-tooltip input[type=text] {
          background: hsl(var(--background));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow a {
          color: hsl(var(--primary));
        }
        
        .dark .rich-text-editor .ql-toolbar.ql-snow {
          border-color: hsl(var(--border));
          background: hsl(var(--card));
        }
        
        .dark .rich-text-editor .ql-container.ql-snow {
          border-color: hsl(var(--border));
          background: hsl(var(--background));
        }
        
        .dark .rich-text-editor .ql-editor {
          color: hsl(var(--foreground));
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker {
          color: hsl(var(--foreground));
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker-label {
          color: hsl(var(--foreground));
        }
        
        .dark .rich-text-editor .ql-toolbar .ql-picker-label .ql-stroke {
          stroke: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
}
