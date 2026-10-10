// NOTE: Guidance-only module; no Word conversion or upload handling is implemented.
// TODO: Authorize management access and validate .docx type, size, and decompression
// limits on the server. Sanitize converted content/URLs; never execute imports.
// Preserve headings, formatting, lists, links, images, simple tables, and furigana.
// Produce a draft with preview and warnings for unsupported content; require review
// before publication. Conversion failure must leave published material untouched.
// Add a server-only boundary when implemented; question-set imports are deferred.
// See docs/developer-guide.md, Learn.

export {};
