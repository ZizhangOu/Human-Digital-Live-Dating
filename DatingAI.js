const puppeteer = require('puppeteer');

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey:"",
});
const openai = new OpenAIApi(configuration);


(async () => {
  // Use the provided webSocketDebuggerUrl
  const webSocketDebuggerUrl = '';

  // Connect to the remote Chrome instance using the webSocketDebuggerUrl
  const browser = await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl, defaultViewport: null });

  // Get the list of browser targets
  const targets = await browser.targets();

  // Find the first non-background page target (usually the active tab)
  const pageTarget = targets.find(target => target.type() === 'page' && target.url() !== 'about:blank');

 

  if (!pageTarget) {
    console.error('No active page found.');
    await browser.disconnect();
    return;
  }

  // Connect to the page target
  const page = await pageTarget.page();
 
  await page.setViewport({
    width: 400,
    height: 600,
    deviceScaleFactor: 2
  });


  
 

   // Navigate to a URL in the first pages
   await page.goto('https://tinder.com/app/matches');

   

/* Get all the  cenversation and open it */
  await page.waitForSelector('.messageList > ul > li > div > div > a');

   const [firstLink] = await page.$$('.messageList > ul > li > div > div > a');
   if (firstLink) {
     const linksText = await page.$$eval('.messageList > ul > li > div > div > a', links => links.map(link => link.textContent.trim()));
     console.log('Links Text:', linksText);
     console.log('Clicking the first link:', linksText[1]);
     await firstLink.click();
   } else {
     console.log('No link found');
   }

/* Get all the  cenversation and open it */  


   
   await page.waitForTimeout(10000); // pause execution for 3 seconds
console.log('Waited for 3 seconds!');


/* Get all the text and send it to chatgpt and receive respones */



const texts = await page.$$eval('.text', (elements) => {
  return elements.map((element) => {
    const parentDiv = element.closest('div');
    const isSendBubble = parentDiv && parentDiv.classList.contains('C($c-ds-text-chat-bubble-send)');

    if (isSendBubble) {
      return 'Me: ' + element.textContent;
    } else {
      return element.textContent;
    }
  });
});

console.log(texts);


/*  send it to chatgpt and receive respones */


// Call OpenAI's GPT-3 model
const prompt = "Now you are a boy study xxx in uni,try to ask girl out for a date. You are the one with "me" in this conversation,try to generate the conversation,when the time is right ask for a date ,use english to answer.以下是对话:\n" + texts.join("\n");
const completion = await openai.createCompletion({
  model: "text-davinci-003",
  prompt: prompt,
});


const response = completion.data.choices[0].text.trim();
console.log("AI Response:", response);


/*  send it to chatgpt and receive respones */


/* Get all the text and send it to chatgpt and receive respones */




/* Input the respones to conversation */


// Type text into the text area
const textArea = await page.$('textarea');
await textArea.type(response);


/*Input the respones to conversation*/


  // Close the browser connection
  await browser.disconnect();
})();``
