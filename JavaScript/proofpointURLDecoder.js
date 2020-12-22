function decode_proofpoint(rewritten_url) {
    // entirely based on Proofpoints Python Script
    // intialize regex expressions
    const ud_pattern = /https:\/\/urldefense(?:\.proofpoint)?\.com\/(v[0-9])\//;
    //fixed pattern according to test URL on thier website. Thier Regex doesnt consider '&amp' between the url and k= causes it to not be picked up.
    const v1_pattern = /u=(?<url>.+?)&.+?k=/;
    const v2_pattern = /u=(?<url>.+?)&[dc]=/;
    const v3_pattern = /v3\/__(?<url>.+?)__;(?<enc_bytes>.*?)!/;
    const v3_token_pattern = /\*(\*.)?/g;

    // initated variables for encoding process, wierd shit but its best i could parse from python dicts
    const v3_run_mapping = [];
    const run_values = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
    const run_length = 2;
    // v3_run_mapping is basically reversed, in python its dict of <char>:# here its array of [#]:<char>
    v3_run_mapping[0, 1] = '';
    for(let x = 2; x < run_values.length; x++) {
        v3_run_mapping[x] = run_values.charAt(x);
    }

    // doublecheks this is a proofpoint url, can move this log else where in code
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
        console.log('Does not appear to be a URL defense URL');
    }

    // copied logic, UNTESTED, literally dont have any v1s to test with. Ive double checked the code and it looks right?
    function decode_v1(url) {
        const v1_match = url.match(v1_pattern);
        if(v1_match != null) {
            const encoded_url = v1_match.groups['url'];
            const html_encoded_url = decodeURIComponent(encoded_url);
            const end_url = unescape(html_encoded_url);
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
            const end_url = unescape(html_encoded_url);
            return end_url;
        } else{
            console.log(v2_match);
            console.log('Error Parsing URL');
            return url;
        }
    }
    // coppied PP logic
    function decode_v3(url) {
        let dec_bytes = [];
        let current_marker = 0;
        function replace_token(token) {
            if(token == '*') {
                const character = dec_bytes[current_marker];
                current_marker += 1;
                return character;
            }
            if(token.startsWith('**')) {
                // bout a 10% chance this actually works
                const run_lengths = v3_run_mapping[token[-1]];
                const run = dec_bytes.slice(current_marker(current_marker + run_lengths));
                current_marker += run_lengths;
                return run;
            }
        }

        function substitute_tokens(text, start_pos=0){
            // JS logic to only search past start pos
            const token_match = text.slice(start_pos).match(v3_token_pattern);
        
            if(token_match != null){
                const start = text.slice(start_pos, token_match['index']);
                let built_string = start;
                // JS logic to slice start to end, possibly un needed testing match obj
                // let token = text.slice(token_match['index'], (token_match['index']+token_match['input'].length-1));
                let token = token_match[0];
                built_string += replace_token(token);
                // JS logic to find end of matched string
                built_string += substitute_tokens(text, (token_match['index']+token_match['input'].length-1) );
                return built_string;
            } else {
                return text.slice(start_pos, text.length);
            }
        }
        
        //main logic to return 
        const v3_match = url.match(v3_pattern);
        console.log(v3_match);
        if(v3_match != null) {
            const url =  v3_match.groups['url'];
            const encoded_url = decodeURIComponent(url);
            let enc_bytes = v3_match.groups['enc_bytes'];
            enc_bytes += '==';
            //javascript equivilant of urlsafe base64 decode
            dec_bytes = (Buffer.from(enc_bytes, 'base64').toString());
            return substitute_tokens(encoded_url);
        } else {
            console.log('Error Parsing URL');
            return url;
        }
    }
}

const ppURL = 'https://urldefense.proofpoint.com/v2/url?u=https-3A__github.com_causeImCloudy_URLDecoder_invitations&d=DwMCaQ&c=boMkH2b25ifeBWryr50Oug&r=6dyxxfLZ7P1OIkFOrrm0uiIHALMjQWTaDg4hHtsWAn8&m=3_b6VPH_jORcNSGutGzSO4FZ5rDMmKfj1ZB9yBfraWM&s=bsVHT8XI1Wldw9usnUSTzM9gx6vbFmOTTbwuJ-Vpx1o&e=';
const ppURLv3 = 'https://urldefense.com/v3/__https://myeqt.box.com/folder/120420863921?utm_source=trans&amp;utm_medium=email&amp;utm_campaign=collab*2Bauto*20accept*20user__;JSUl!!Nrz4EcbiUYLJF9sf!q2BdO7kb1x2aUELyXPoFPwZykzl_JpoNBcOLpQzHL6e9x5NmldfVroeEao7P9Fs$';
const ppURLv1 = 'https://urldefense.proofpoint.com/v1/url?u=http://www.bouncycastle.org/&amp;k=oIvRg1%2BdGAgOoM1BIlLLqw%3D%3D%0A&amp;r=IKM5u8%2B%2F%2Fi8EBhWOS%2BqGbTqCC%2BrMqWI%2FVfEAEsQO%2F0Y%3D%0A&amp;m=Ww6iaHO73mDQpPQwOwfLfN8WMapqHyvtu8jM8SjqmVQ%3D%0A&amp;s=d3583cfa53dade97025bc6274c6c8951dc29fe0f38830cf8e5a447723b9f1c9a';
console.log(decode_proofpoint(ppURLv1));