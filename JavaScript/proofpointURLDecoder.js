  /*
    JavaScript Equivilant of the Python script provided on the proofpoint website.
    This parsing contians several updates to logic/translation issue, where I attempted
    to comment my find and what was logic was updated from the original provided by Proofpoint.
    Updated 12/22/2020. 
    Created by Carter Loyd https://github.com/causeImCloudy
*/
function decode_proofpoint(rewritten_url) {
    //fixing encoding issue where &amp; doesnt get resolve to &, so this is a manual fix. Will investigate possible issues, resolutions to this.
    rewritten_url = rewritten_url.replace(/&amp;/g,'&');

    // intialize regex expressions all slightly modiefied to work in JS
    const ud_pattern = /https:\/\/urldefense(?:\.proofpoint)?\.com\/(v[0-9])\//;
    const v1_pattern = /u=(?<url>.+?)&.+?k=/;
    const v2_pattern = /u=(?<url>.+?)&[dc]=/;
    const v3_pattern = /v3\/__(?<url>.+?)__;(?<enc_bytes>.*?)!/;
    const v3_token_pattern = /\*(\*.)?/;

    // initated variables for encoding process, using array in reveres logic to python as python was using a dict
    const v3_run_mapping = [];
    const run_values = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    const run_length = 2;
    // v3_run_mapping is basically reversed, in python its dict of <char>:# here its array of [#]:<char>
    v3_run_mapping[0, 1] = '';
    for(let x = 2; x < run_values.length; x++) {
        v3_run_mapping[x] = run_values.charAt(x);
    }

    // double checks this is a Proofpoint URL and parses into regex groups
    const match = rewritten_url.match(ud_pattern);
    if(match != null) {
        if(match[1] == 'v1') {
            return decode_v1(rewritten_url);
        } else if(match[1] == 'v2') {
            return decode_v2(rewritten_url);
        } else if(match[1] == 'v3') {
            return decode_v3(rewritten_url);
        } else{
            console.log('Unrecognized version in: ' + rewritten_url);
        }
    } else{
        // else incase error or not PP url, returns submited URL
        console.log('Does not appear to be a URL defense URL');
        return rewritten_url;
    }

    // copied logic, 
    function decode_v1(url) {
        const v1_match = url.match(v1_pattern);
        if(v1_match != null) {
            const encoded_url = v1_match.groups['url'];
            const html_encoded_url = decodeURIComponent(encoded_url);
            const end_url = decodeURI(html_encoded_url);
            return end_url;
        } else{
            console.log('Error Parsing URL');
            return url;
        }
    }
    // coppied PP logic, then modified falty logic to acutally run
    function decode_v2(url) {
        const v2_match = url.match(v2_pattern);
        if(v2_match != null) {
            const special_encoded_url = v2_match.groups['url'];
            // proofpoint sucks at coding apperntly but their translation isnt correct, atleast not for python3 but this is the equivliant for V2 that works in JS
            const url_encoded_url = special_encoded_url.replace(/_/g, '/').replace(/-/g, '%');
            const html_encoded_url = decodeURIComponent(url_encoded_url);
            const end_url = decodeURI(html_encoded_url);
            return end_url;
        } else{
            console.log('Error Parsing URL');
            return url;
        }
    }
    // coppied PP logic
    function decode_v3(url) {
        // initalize global variables within decode_v3 function as opposed to this being a class and referencing a self variable
        let dec_bytes = [];
        let current_marker = 0;

        // function to replace identify then replace the token according to PP encoding standards
        function replace_token(token) {
            if(token == '*') {
                const character = dec_bytes[current_marker];
                current_marker += 1;
                return character;
            }
            if(token.startsWith('**')) {
                // !!! UNTESTED dont have a v3 url with a url that can test this. this is a copy from Python code not sure what the [-1] does to an array or if its the same in JS
                const run_lengths = v3_run_mapping[token[-1]];
                const run = dec_bytes.slice(current_marker, (current_marker + run_lengths));
                current_marker += run_lengths;
                return run;
            }
        }

        // recursive function to work through identified URL and replace token respectivley
        function substitute_tokens(text, start_pos=0){
            // JS logic to only search past start pos, matches later indices to add start_pos to correct spacing
            const token_match = text.slice(start_pos).match(v3_token_pattern);
            if(token_match != null){
                //slice to take from token to new param and add to built string.
                const start = text.slice(start_pos, start_pos+token_match['index']);
                let built_string = start;
                const token = token_match[0];
                built_string += replace_token(token);
                // JS logic to move past current identified param
                built_string += substitute_tokens(text, (token_match['index']+start_pos+1));
                return built_string;
            } else {
                // exit case for recurrsive function
                return text.slice(start_pos, text.length);
            }
        }
        
        // creates match obj then decodes from differnt parts of url
        const v3_match = url.match(v3_pattern);
        if(v3_match != null) {
            const url =  v3_match.groups['url'];
            const encoded_url = decodeURIComponent(url);
            let enc_bytes = v3_match.groups['enc_bytes'];
            enc_bytes += '==';
            //javascript equivilant of urlsafe base64 decode
            dec_bytes = decodeURIComponent(escape((Buffer.from(enc_bytes, 'base64'))));
            return substitute_tokens(encoded_url);
        } else {
            console.log('Error Parsing URL');
            return url;
        }
    }
}