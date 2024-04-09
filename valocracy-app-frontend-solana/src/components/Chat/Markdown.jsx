import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'

function MarkdownFormatter({ text }) {
  return <p style={{lineHeight:'20px'}}> <ReactMarkdown remarkPlugins={[remarkGfm]} >{text}</ReactMarkdown> </p>;
}

export default MarkdownFormatter;
