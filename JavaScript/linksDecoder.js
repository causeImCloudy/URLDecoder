function decode_proofpoint(url){

}
function decode_barracuda(url){
    //slicing encoded URL according to barracude standards
    //https://campus.barracuda.com/product/essentials/doc/49055519/understanding-link-protection/
    var right = url.search('&');
    var left = url.search('=');
    var link = url.slice(left+1, right);
    return safeDecodeURIComponent(link);
}
function decode_microsoftSafelinks(url){
    //slicing encoded URL according to Micorsoft docs 
    //https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/atp-safe-links?view=o365-worldwide
    //no clear documentation on right side, appears to be &<classifier> = ##| using what ive seen this should technically work if it stays the same
    var right = url.search(/\&.{0,8}\|/);
    var left = url.search('=');
    var link = url.slice(left+1, right);
    return safeDecodeURIComponent(link);

    //unconfirmed code from what i could find on google, not read to put it in yet
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
function safeDecodeURIComponent(url){
    //function to safely run decode URI component and add a catch to return url if fail for what ever reason.
    try{
        return decodeURIComponent(url);
    }
    catch(error){
        return url;
        console.log('Error attempt to decode URI Component returning basic URL and continuing.' + error.message);
    }
}

function decode_link_to_URL(url){
    //global link to return the link from function
    var returnLink;
    //incase url its self is encode, decode the url
    url = safeDecodeURIComponent(url);

    //start try catch with if statments to determine which link it is 
    try {
        if(url.search('proofpoint')!= -1){
            returnLink ='Proofpoint';
        }
        else if(url.search('safelinks') != -1){
            //selector for Microsoft O365 ATP links
            returnLink = decode_microsoftSafelinks(url);
        }
        else if(url.search('cudasvc')!= -1){
            //selector for barracuda domain should be cudasvc and issue decode and return decoded url
            returnLink = decode_barracuda(url);
        }
        else{
            var errorMsg = 'Error: No decoding occured possible unencoded link.\t';
            returnLink = errorMsg.concat(url);
        }
        return safeDecodeURIComponent(returnLink);
    }
    catch(err){
        console.log('Error Decoding URL' + err.message);
    }

}

 //test urls
//url = 'https://ilklylakzrydpfzxnzhvzxpcvv-dot-gle=owayel400503.uc.r.appspot.com/#kreynolds@gulfportenergy.com';
//cudaURL= 'https://linkprotect.cudasvc[.]com/url?a=https%3a%2f%2f735653088253355-dot-my-inbound-centaur-296113.ew.r.appspot.com%2f%23teow%40cp.com&c=E,1,87IKBrZO_tq9A4plga3BuFAJ8d0nMf_iYgO5_XpoXLxXo9_L-iMTQNNsuJBGILlndQ_V-W7ExaSrqbA7gzM8J4BNnZV7NoNtEhXzQwTahpk,&typo=1';
//ppURL ='https://urldefense.proofpoint.com/v2/url?u=https-3A__github.com_causeImCloudy_URLDecoder_invitations&d=DwMCaQ&c=boMkH2b25ifeBWryr50Oug&r=6dyxxfLZ7P1OIkFOrrm0uiIHALMjQWTaDg4hHtsWAn8&m=3_b6VPH_jORcNSGutGzSO4FZ5rDMmKfj1ZB9yBfraWM&s=bsVHT8XI1Wldw9usnUSTzM9gx6vbFmOTTbwuJ-Vpx1o&e=';
safelinksURL = 'https://nam04.safelinks.protection.outlook.com/?url=http%3A%2F%2Furl6136.tipclub.com%2Fss%2Fc%2F_mxs2vKWp558PtUnhzmC_zMOq7f4oNUzZNnL3m2g8uClRBTRDglLGCnVARA-hjDwrXts13wuVkRfGbvY8sA1PA%2F34g%2FvRK0Yr21QIWa4RGNgbS90Q%2Fh0%2Fjq7HtmQi0PPb3R9HbUi5BUbaFtpOxT1FpuiC5hU_AYE&data=02%7C01%7Cjanetseaberg%40carfax.com%7C0ad58f113e2e479431e608d844627c66%7Ceede1cd6fd2e46028f86b0987aa24ca2%7C0%7C0%7C637334537068382419&sdata=09J4P2mB1xQ3ySWwSOPps1l2B%2Fjhw7FjsjHFKu9NB%2Fk%3D&reserved=0';
    
console.log(decode_link_to_URL(safelinksURL));