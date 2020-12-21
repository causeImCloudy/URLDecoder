function decode_proofpoint(url){

}
function decode_barracuda(url){
    var right = url.search('&');
    var left = url.search('=');
    var link = url.slice(left, right);
    return link;
}
function decode_microsoftSafelinks(url){

}

function decode_link_to_URL(url){
    //global link to return the link from function
    var returnLink;
    
    try {
        if(url.search('proofpoint')!= -1){
            returnLink ='Proofpoint';
        }
        else if(url.search('cudasvc')){
            return decode_barracuda(url);
        }
        else{
            var errorMsg = 'Error: No decoding occured possible unencoded link.\t';
            returnLink = errorMsg.concat(url);
        }
        return returnLink;
    }
    catch(err){
        console.log('Error Decoding URL' + err.message);
    }

}

 //test urls
//url = 'https://ilklylakzrydpfzxnzhvzxpcvv-dot-gle=owayel400503.uc.r.appspot.com/#kreynolds@gulfportenergy.com';
cudaURL= 'https://linkprotect.cudasvc.com/url?a=3Dhttps%3a%2f%2=fn.wpcrs.net%2fu%3fid%3dXR1RYR%26ifca%3dWCA336&c=3DE,1,clkANjcAicbjE8TWthPj=APKPAo8ESft5v_cqE_E-8786ttxWnCa7QRvMIsuwtkccxXUn5vIqzvwWxvDE5exv9CoDB-ADHgP=N15ellDF3&typo=3D1';
//ppURL ='https://urldefense.proofpoint.com/v2/url?u=https-3A__github.com_causeImCloudy_URLDecoder_invitations&d=DwMCaQ&c=boMkH2b25ifeBWryr50Oug&r=6dyxxfLZ7P1OIkFOrrm0uiIHALMjQWTaDg4hHtsWAn8&m=3_b6VPH_jORcNSGutGzSO4FZ5rDMmKfj1ZB9yBfraWM&s=bsVHT8XI1Wldw9usnUSTzM9gx6vbFmOTTbwuJ-Vpx1o&e=';
//safelinksURL = 'https://nam04.safelinks.protection.outlook.com/?url=http%3A%2F%2Furl6136.tipclub.com%2Fss%2Fc%2F_mxs2vKWp558PtUnhzmC_zMOq7f4oNUzZNnL3m2g8uClRBTRDglLGCnVARA-hjDwrXts13wuVkRfGbvY8sA1PA%2F34g%2FvRK0Yr21QIWa4RGNgbS90Q%2Fh0%2Fjq7HtmQi0PPb3R9HbUi5BUbaFtpOxT1FpuiC5hU_AYE&data=02%7C01%7Cjanetseaberg%40carfax.com%7C0ad58f113e2e479431e608d844627c66%7Ceede1cd6fd2e46028f86b0987aa24ca2%7C0%7C0%7C637334537068382419&sdata=09J4P2mB1xQ3ySWwSOPps1l2B%2Fjhw7FjsjHFKu9NB%2Fk%3D&reserved=0';
    
console.log(decode_link_to_URL(cudaURL));