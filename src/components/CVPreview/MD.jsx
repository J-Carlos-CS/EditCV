import { renderMarkdown } from '../../utils/markdown'

export default function MD({ text, className, tag: Tag = 'span' }) {
  if (!text) return null
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  )
}
