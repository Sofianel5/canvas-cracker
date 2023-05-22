const TOKEN = '';

async function streamCompletion(messages){
    try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: 'Bearer ' + TOKEN
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: messages,
              stream: true
            })
          }
        );
  
        if (!response.ok) {
          console.error(`Error: ${response.statusText}`);
          return;
        }
  
        const reader = response.body?.getReader();
        if (!reader) {
          console.error("Error: fail to read data from response");
          return;
        }
        
        let res = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
  
          const textDecoder = new TextDecoder("utf-8");
          const chunk = textDecoder.decode(value);
  
          console.log(chunk);
  
          for (const line of chunk.split("\n")) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine === "data: [DONE]") {
              continue;
            }
  
            const json = trimmedLine.replace("data: ", "");
            const obj = JSON.parse(json);
            const content = obj["choices"][0]["delta"]["content"];
            res = res.concat(content ?? "");
          }
  
          document.getElementById("completion").innerHTML = res.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
        }
        chrome.storage.local.set({ completion: res }).then(() => {
            console.log("Value is set to " + ( res ?? "null"));
        });
      } catch (e) {
        console.error(e);
      }
}

async function createCompletion() {
    const res = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const tabId = res[0].id
    document.getElementById("completion").innerHTML = "Loading..."
    const response = await chrome.tabs.sendMessage(tabId, {completion: "create"});
    console.log("recieved: ", response)
    var messages = [
        {"role": "system", "content": "You are a helpful tutoring assistant. Please help the user with their quiz. You must think through your process step-by-step before deciding on an answer. The user is having trouble with the following question:"},
        {"role": "user", "content": response}
    ]
    streamCompletion(messages)
}

document.getElementById("createbtn").addEventListener("click", createCompletion);

chrome.storage.local.get(["completion"]).then((result) => {
    console.log(result)
    console.log("Value currently is " + result.completion);
    if (result) {
        document.getElementById('completion').innerHTML = result.completion.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    }
});