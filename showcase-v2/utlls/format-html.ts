const SELF_CLOSING_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export function formatHTML(htmlString: string): string {
  // Parse the HTML string into a DOM
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlString, "text/html");

  return walk(document.body.firstChild!, 0);

  // Recursively format the DOM tree
  function walk(node: Node, indentLevel: number): string {
    let formatted = "";
    const indent = "  ".repeat(indentLevel);

    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        const element = node as HTMLElement;
        formatted += `${indent}<${element.tagName.toLowerCase()}`;

        // Add attributes
        Array.from(element.attributes).forEach((attr) => {
          formatted += ` ${attr.name}="${attr.value}"`;
        });

        if (SELF_CLOSING_TAGS.has(element.tagName.toLowerCase())) {
          formatted += " />\n";
        } else {
          formatted += ">\n";

          Array.from(element.childNodes).forEach((child) => {
            formatted += walk(child, indentLevel + 1);
          });

          formatted += `${indent}</${element.tagName.toLowerCase()}>\n`;
        }
        break;

      case Node.TEXT_NODE:
        const text = node.textContent?.trim();
        if (text) {
          formatted += `${indent}${text}\n`;
        }
        break;

      case Node.COMMENT_NODE:
        const comment = node as Comment;
        formatted += `${indent}<!--${comment.data}-->\n`;
        break;
    }

    return formatted;
  }
}
