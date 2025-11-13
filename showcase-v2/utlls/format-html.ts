export function formatHTML(htmlString: string): string {
  // Parse the HTML string into a DOM
  const parser = new DOMParser();
  const document = parser.parseFromString(htmlString, "text/html");

  // Recursively format the DOM tree
  function formatNode(node: Node, indentLevel: number): string {
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

        if (element.childNodes.length === 0) {
          formatted += " />\n";
        } else {
          formatted += ">\n";

          Array.from(element.childNodes).forEach((child) => {
            formatted += formatNode(child, indentLevel + 1);
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

  return formatNode(document.body.firstChild!, 0);
}
