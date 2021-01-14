// JS Function to decode proofpoint urls copied over from my javascript file
function decode_proofpoint(rewritten_url) {
    //fixing encoding issue where &amp; doesnt get resolve to &, so this is a manual fix. Will investigate possible issues, resolutions to this.
    rewritten_url = rewritten_url.replace(/&amp;/g,'&');

    // intialize regex expressions all slightly modiefied to work in JS
    const ud_pattern = /https:\/\/urldefense(?:\.proofpoint)?\.com\/(v[0-9])\//;
    const v1_pattern = /u=(?<url>.+?)&.*?k=/;
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
            const html_encoded_url = safeDecodeURIComponent(encoded_url);
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
            const html_encoded_url = safeDecodeURIComponent(url_encoded_url);
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
            const encoded_url = safeDecodeURIComponent(url);
            let enc_bytes = v3_match.groups['enc_bytes'];
            enc_bytes += '==';
            //javascript equivilant of urlsafe base64 decode
            dec_bytes = decodeURI(escape((Buffer.from(enc_bytes, 'base64'))));
            return substitute_tokens(encoded_url);
        } else {
            console.log('Error Parsing URL');
            return url;
        }
    }
}

function decode_barracuda(url) {
    // slicing encoded URL according to barracude standards
    // https://campus.barracuda.com/product/essentials/doc/49055519/understanding-link-protection/
    const right = url.search('&');
    const left = url.search('=');
    const link = url.slice(left + 1, right);
    return safeDecodeURIComponent(link);
}
function decode_microsoftSafelinks(url) {
    // slicing encoded URL according to Micorsoft docs
    // https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/atp-safe-links?view=o365-worldwide
    // no clear documentation on right side, appears to be &<classifier> = ##| using what ive seen this should technically work if it stays the same
    const right = url.search(/\&.{0,8}\|/);
    const left = url.search('=');
    const link = url.slice(left + 1, right);
    return safeDecodeURIComponent(link);

    // unconfirmed code from what i could find on google, not read to put it in yet
    /*
    var url_segments = url.split("?")[1];
    var params = url_segments.split("&");
    for(x=0;x<params.length;x++)
    {
        namval = params[x].split("=");
        if(namval[0]=="url") url = namval[1];
    }
    return safeDecodeURIComponent(url)
    */
}
function safeDecodeURIComponent(url) {
    // function to safely run decode URI component and add a catch to return url if fail for what ever reason.
    try {
        return decodeURIComponent(url);
    } catch (error) {
        console.log('Error attempt to decode URI Component returning basic URL and continuing.' + error.message);
        return url;
    }
}

function decode_link_to_URL(url) {
    // global link to return the link from function
    let returnLink;
    // incase url its self is encode, decode the url
    url = safeDecodeURIComponent(url);

    // start try catch with if statments to determine which link it is
    try {
        if (url.search('proofpoint') != -1) {
            returnLink = decode_proofpoint(url);
        } else if (url.search('safelinks') != -1) {
            // selector for Microsoft O365 ATP links
            returnLink = decode_microsoftSafelinks(url);
        } else if (url.search('cudasvc') != -1) {
            // selector for barracuda domain should be cudasvc and issue decode and return decoded url
            returnLink = decode_barracuda(url);
        } else {
            const errorMsg = 'Error: No decoding occured possible unencoded link.\t';
            returnLink = errorMsg.concat(url);
        }

        return returnLink;
    } catch (err) {
        console.log('Error Decoding URL' + err.message);
    }

}
