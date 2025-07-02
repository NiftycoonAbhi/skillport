import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase'; // Assuming your firebase config is in ../firebase.js or ../firebase/index.js
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Or any other style you prefer
import {
  FiEdit3, FiSave, FiTag, FiBookOpen, FiEye, FiXCircle, FiCheckCircle, FiCode, FiLink, FiPaperclip
} from 'react-icons/fi';

// Markdown renderer components for richer preview
// This ensures code blocks are properly highlighted
const renderers = {
  code: ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={solarizedlight} // Apply the chosen syntax highlighting style
        language={match[1]}
        PreTag="div" // Render as a div
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
};

function NoteEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // 'success' or 'error'
  const contentRef = useRef(null); // Ref for the textarea to manage focus for toolbar actions

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ text: 'Title and Content are required.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' }); // Clear any previous messages

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage({ text: 'You must be logged in to save a note.', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'notes'), {
        uid: user.uid,
        title: title.trim(),
        content: content.trim(),
        // Split tags by comma, trim whitespace, and filter out any empty strings
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage({ text: 'Note saved successfully!', type: 'success' });
      // Reset form fields after successful save
      setTitle('');
      setContent('');
      setTags('');
    } catch (error) {
      console.error('Error saving note:', error);
      setMessage({ text: `Failed to save note: ${error.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to insert markdown syntax at the current cursor position
  const insertMarkdown = (syntax) => {
    const textarea = contentRef.current;
    if (!textarea) return; // Ensure textarea ref is available

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;

    let newContent;
    let newCursorPosition;

    switch (syntax) {
      case 'bold':
        newContent = currentContent.substring(0, start) + '**' + currentContent.substring(start, end) + '**' + currentContent.substring(end);
        newCursorPosition = start + 2; // Position cursor between the asterisks if nothing was selected
        break;
      case 'italic':
        newContent = currentContent.substring(0, start) + '*' + currentContent.substring(start, end) + '*' + currentContent.substring(end);
        newCursorPosition = start + 1; // Position cursor between the asterisks if nothing was selected
        break;
      case 'heading':
        newContent = currentContent.substring(0, start) + '# ' + currentContent.substring(start, end) + currentContent.substring(end);
        newCursorPosition = start + 2; // Position cursor after '# '
        break;
      case 'code':
        newContent = currentContent.substring(0, start) + '```\n' + currentContent.substring(start, end) + '\n```' + currentContent.substring(end);
        newCursorPosition = start + 4; // Position cursor after '```\n'
        break;
      case 'link':
        newContent = currentContent.substring(0, start) + '[Link Text](https://example.com)' + currentContent.substring(end);
        newCursorPosition = start + 1; // Position cursor inside 'Link Text'
        break;
      case 'image':
        newContent = currentContent.substring(0, start) + '![Alt Text](https://example.com/image.jpg)' + currentContent.substring(end);
        newCursorPosition = start + 2; // Position cursor inside 'Alt Text'
        break;
      default:
        return; // Do nothing for unknown syntax
    }

    setContent(newContent); // Update the content state

    // Use requestAnimationFrame to ensure the DOM is updated before setting selection
    requestAnimationFrame(() => {
      textarea.focus(); // Re-focus the textarea
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition; // Set cursor position
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full space-y-8 p-10 bg-white rounded-3xl shadow-2xl border border-gray-200">

        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-8">
          <FiEdit3 className="text-6xl text-purple-600 mb-4 animate-pulse-slow" /> {/* Icon with animation */}
          <h2 className="text-5xl font-extrabold text-gray-900 text-center tracking-tight leading-tight">
            Create a New Note
          </h2>
          <p className="mt-3 text-lg text-gray-600 text-center max-w-2xl">
            Capture your thoughts, ideas, and knowledge using Markdown.
            Organize them with tags for easy retrieval later.
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`flex items-center p-4 rounded-xl shadow-md ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-300 text-green-800'
              : 'bg-red-50 border border-red-300 text-red-800'
          }`}>
            {message.type === 'success' ? <FiCheckCircle className="mr-3 text-green-500 text-2xl" /> : <FiXCircle className="mr-3 text-red-500 text-2xl" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Note Form */}
        <form onSubmit={handleSaveNote} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="sr-only">Note Title</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiBookOpen className="h-5 w-5 text-gray-400" /> {/* Icon for title */}
              </div>
              <input
                id="title"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out placeholder-gray-400 text-lg font-semibold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A compelling note title..."
                required
              />
            </div>
          </div>

          {/* Markdown Toolbar */}
          <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl shadow-inner">
            {/* Toolbar buttons to insert markdown syntax */}
            <button type="button" onClick={() => insertMarkdown('bold')} className="btn-toolbar">**B**</button>
            <button type="button" onClick={() => insertMarkdown('italic')} className="btn-toolbar">_I_</button>
            <button type="button" onClick={() => insertMarkdown('heading')} className="btn-toolbar">H1</button>
            <button type="button" onClick={() => insertMarkdown('code')} className="btn-toolbar"><FiCode className="text-lg" /></button>
            <button type="button" onClick={() => insertMarkdown('link')} className="btn-toolbar"><FiLink className="text-lg" /></button>
            <button type="button" onClick={() => insertMarkdown('image')} className="btn-toolbar"><FiPaperclip className="text-lg" /></button>
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="content" className="sr-only">Note Content</label>
            <textarea
              ref={contentRef} // Assign ref to the textarea
              id="content"
              className="w-full h-64 p-4 border border-gray-300 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out font-mono text-base resize-y placeholder-gray-400"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Start writing your note here using Markdown!
# Heading 1
## Heading 2
* List item 1
* List item 2
**Bold text**
_Italic text_
[Link to Google](https://google.com)
\`Inline code\`
\`\`\`javascript
const hello = 'world';
console.log(hello);
\`\`\`
`}
              required
            />
          </div>

          {/* Tags Input */}
          <div>
            <label htmlFor="tags" className="sr-only">Tags</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="h-5 w-5 text-gray-400" /> {/* Icon for tags */}
              </div>
              <input
                id="tags"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-200 ease-in-out placeholder-gray-400"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (e.g., react, javascript, firebase, learning)"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">Separate tags with commas.</p>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg rounded-xl shadow-lg font-bold
              ${isSubmitting
                ? 'bg-purple-400 text-white cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105'
              }`}
          >
            {isSubmitting ? (
              <>
                {/* Spinner SVG */}
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Note...
              </>
            ) : (
              <>
                <FiSave className="mr-3 text-2xl" /> Save Note
              </>
            )}
          </button>
        </form>

        {/* Preview Section */}
        <div className="mt-12 pt-8 border-t-2 border-gray-100">
          <div className="flex items-center mb-4">
            <FiEye className="text-3xl text-indigo-600 mr-3" />
            <h3 className="text-3xl font-bold text-gray-800">Note Preview</h3>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl shadow-inner border border-gray-200 min-h-[200px]">
            {content ? (
              <article className="prose max-w-none text-gray-800">
                {/* Render markdown content with custom renderers for code highlighting */}
                <ReactMarkdown components={renderers}>{content}</ReactMarkdown>
              </article>
            ) : (
              <p className="text-gray-500 text-center py-10">
                Start typing in the editor above to see your note preview here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteEditor;