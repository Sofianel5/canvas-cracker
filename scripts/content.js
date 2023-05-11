function getText(node, accumulator) {
    if (node.nodeType === 3) // 3 == text node
      accumulator.push(node.nodeValue)
    else
      for (let child of node.childNodes)
          child.tagName == 'STYLE' ? '' : getText(child, accumulator)
}

function getContent() {
    var text = []
    element = document.querySelector('#questions')
    getText(element, text)
    content = text.join('')
    return content
}



chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.completion == "create") {
            const text = getContent()
            sendResponse(text)
        }
    } 
)

console.log("loaded content.js")