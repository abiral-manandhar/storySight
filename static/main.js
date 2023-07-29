const engine_id = "stable-diffusion-v1-5";
const api_host = 'https://api.stability.ai';
const api_key = "sk-rRrmhlcwGG4uCLlFqTPr4DkcimJhmyRcyOjGlGnQbVwMu8fS";
let button = document.querySelector(".submit")
let prompt = document.querySelector(".prompt")
let url = ""
let container = document.querySelector(".container")

var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();
console.log(voices)
msg.voice = voices[1];
msg.volume = 1; // From 0 to 1
msg.rate = 1
msg.lang = 'en';


let temp;
if ('speechSynthesis' in window) {
}else{
  alert("Sorry, your browser doesn't support text to speech!");
}

if (api_key === null) {
    throw new Error("Missing Stability API key.");
}

let text_prompts = [

];


button.addEventListener('click', (e)=>{
    temp = prompt.value
    console.log( prompt.value)
    msg.text = temp
    prompt.value = ""
    setTimeout(function() {
    speechSynthesis.speak(msg);
    }, 5000);

const requestOptionsTwo = {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    body: JSON.stringify({
        "prompt": temp
    })
};


fetch("http://127.0.0.1:8000/process", requestOptionsTwo)
    .then(response => {
        if (!response.ok) {
            throw new Error("Non-200 response: " + response.status);
        }
        return response.json();
    })
    .then(data => {


    console.log(data['audio'])

        data['data'].map((i)=>{
         fetch(`${api_host}/v1/generation/${engine_id}/text-to-image`,
         {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer " + api_key // Encoding API key in Base64
    },
    body: JSON.stringify({
        "text_prompts": [{"text": i}],
        "cfg_scale": 7,
        "clip_guidance_preset": "FAST_BLUE",
        "height": 512,
        "width": 512,
        "samples": 1,
        "steps": 30,
        "style_preset": 'digital-art'
    })
}
     )
    .then(response => {
        if (!response.ok) {
            throw new Error("Non-200 response: " + response.status);
        }
        return response.json();
    })
    .then(x => {
        url = (x['artifacts'][0]['base64']);
        let img = new Image()
        img.src = `data:image/png;base64,${url}`
        container.append(img)

    })
    .catch(error => {
        console.error(error);
    });
        })




    })
    .catch(error => {
        console.error(error);
    });

})






