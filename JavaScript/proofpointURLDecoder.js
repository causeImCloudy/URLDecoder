function decode_proofpoint(rewritten_url) {
    // entirely based on Proofpoints Python Script
    // intialize regex expressions
    const ud_pattern = /https:\/\/urldefense(?:\.proofpoint)?\.com\/(v[0-9])\//;
    const v1_pattern = /u=(?<url>.+?)&k=/;
    const v2_pattern = /u=(?<url>.+?)&[dc]=/;
    const v3_pattern = /v3\/__(?<url>.+?)__;(?<enc_bytes>.*?)!/;
    const v3_token_pattern = /\*(\*.)?/;

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
            // proofpoint sucks at coding apperntly but their translation isnt correct, atleast not for python3 but this is the equivliant for V2 that works
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
    function decode_v3(url) {
        const dec_bytes = [];
        let current_marker;
        function replace_token(token) {
            if(token == '*') {
                const character = dec_bytes[current_marker];
                current_marker += 1;
                return character;
            }
            if(token.startsWith('**')) {
                const run_lengths = v3_run_mapping[token[-1]];
                const run = dec_bytes.slice(current_marker(current_marker + run_lengths));
            }
        }
        const v2_match = url.match(v2_pattern);
        if(v2_match != null) {

        } else {
            console.log('Error Parsing URL');
            return url;
        }
    }
}

const ppURL = 'https://urldefense.proofpoint.com/v2/url?u=https-3A__github.com_causeImCloudy_URLDecoder_invitations&d=DwMCaQ&c=boMkH2b25ifeBWryr50Oug&r=6dyxxfLZ7P1OIkFOrrm0uiIHALMjQWTaDg4hHtsWAn8&m=3_b6VPH_jORcNSGutGzSO4FZ5rDMmKfj1ZB9yBfraWM&s=bsVHT8XI1Wldw9usnUSTzM9gx6vbFmOTTbwuJ-Vpx1o&e=';

console.log(decode_proofpoint(ppURL));