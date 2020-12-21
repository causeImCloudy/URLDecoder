import sys
import re
from argparse import ArgumentParser
from base64 import urlsafe_b64decode
import urllib.parse
import html.parser
import string
import argparse

#Python util from proofpoint to decode urls

class URLDefenseDecoder():

    @staticmethod
    def __init__():
        URLDefenseDecoder.ud_pattern = re.compile(r'https://urldefense(?:\.proofpoint)?\.com/(v[0-9])/')
        URLDefenseDecoder.v1_pattern = re.compile(r'u=(?P<url>.+?)&k=')
        URLDefenseDecoder.v2_pattern = re.compile(r'u=(?P<url>.+?)&[dc]=')
        URLDefenseDecoder.v3_pattern = re.compile(r'v3/__(?P<url>.+?)__;(?P<enc_bytes>.*?)!')
        URLDefenseDecoder.v3_token_pattern = re.compile(r"\*(\*.)?")
        URLDefenseDecoder.v3_run_mapping = {}
        run_values = string.ascii_uppercase + string.ascii_lowercase + string.digits + '-' + '_'
        run_length = 2
        for value in run_values:
            URLDefenseDecoder.v3_run_mapping[value] = run_length
            run_length += 1

    def decode(self, rewritten_url):
        match = self.ud_pattern.search(rewritten_url)
        if match:
            if match.group(1) == 'v1':
                return self.decode_v1(rewritten_url)
            elif match.group(1) == 'v2':
                return self.decode_v2(rewritten_url)
            elif match.group(1) == 'v3':
                return self.decode_v3(rewritten_url)
            else:
                raise ValueError('Unrecognized version in: ', rewritten_url)
        else:
            raise ValueError('Does not appear to be a URL Defense URL')

    def decode_v1(self, rewritten_url):
        match = self.v1_pattern.search(rewritten_url)
        if match:
            url_encoded_url = match.group('url')
            html_encoded_url = urllib.parse.unquote(url_encoded_url)
            url = html.unescape(html_encoded_url)
            return url
        else:
            raise ValueError('Error parsing URL')

    def decode_v2(self, rewritten_url):
        match = self.v2_pattern.search(rewritten_url)
        if match:
            special_encoded_url = match.group('url')
            trans = str.maketrans('-_', '%/')
            url_encoded_url = special_encoded_url.translate(trans)
            html_encoded_url = urllib.parse.unquote(url_encoded_url)
            url = html.unescape(html_encoded_url)
            return url
        else:
            raise ValueError('Error parsing URL')

    def decode_v3(self, rewritten_url):
        def replace_token(token):
            if token == '*':
                character = self.dec_bytes[self.current_marker]
                self.current_marker += 1
                return character
            if token.startswith('**'):
                run_length = self.v3_run_mapping[token[-1]]
                run = self.dec_bytes[self.current_marker:self.current_marker + run_length]
                self.current_marker += run_length
                return run

        def substitute_tokens(text, start_pos=0):
            match = self.v3_token_pattern.search(text, start_pos)
            if match:
                start = text[start_pos:match.start()]
                built_string = start
                token = text[match.start():match.end()]
                built_string += replace_token(token)
                built_string += substitute_tokens(text, match.end())
                return built_string
            else:
                return text[start_pos:len(text)]

        match = self.v3_pattern.search(rewritten_url)
        if match:
            url = match.group('url')
            encoded_url = urllib.parse.unquote(url)
            enc_bytes = match.group('enc_bytes')
            enc_bytes += '=='
            self.dec_bytes = (urlsafe_b64decode(enc_bytes)).decode('utf-8')
            self.current_marker = 0
            return substitute_tokens(encoded_url)

        else:
            raise ValueError('Error parsing URL')


def decode_links_to_url(links):
    #accetps an array of links and returns an array of URLs in basic.
    #created for loop within this context in the event of a large number of links that are proofpoint
    #this should avoid creating the decoder object each time saving process time during init on large link pools.

    #for somereason this gives an error but on execution no errors occur
    pp_decoder = URLDefenseDecoder.__init__()

    basic_urls=[]

    for url in links:
        try:
            #prootpoint rewritten urls based on Proofpoints script
            if re.search(r'proofpoint', url[:50], re.IGNORECASE) is not None:
                url = pp_decoder.decode(url)
                if re.search("Error parsing Proofpoint URL", url, re.IGNORECASE) is not None:
                    basic_urls.append(url)
                elif re.search(r'cudasvc', url[:50], re.IGNORECASE) is not None:
                    url = url.split("&")[0]
                    url = url.split("=")[1]
                    basic_urls.append(url)
                else:
                    basic_urls.append(url)
            #Microsoft safelinks 
            elif re.search(r'safelinks', url[:50], re.IGNORECASE) is not None:
                url = url.split("=")[1]
                url = urllib.parse.unquote(url)
                url = url.split('&amp')[0]
                #again
                if re.search(r'cudasvc', url[:50], re.IGNORECASE) is not None:
                    url = url.split("&")[0]
                    url = url.split("=")[1] #!!!!!
                    url = urllib.parse.unquote(url)
                    basic_urls.append(url)
                else:
                    basic_urls.append(url)
            #duplicated here to catch actual cudasvc links
            elif re.search(r'cudasvc', url[:50], re.IGNORECASE) is not None:
                    url = urllib.parse.unquote(url)
                    url = url.split("&")[0]
                    url = url.split("=")[1]
                    basic_urls.append(url)
            else:
                basic_urls.append(url)
        except Exception as e:
            print(e)
            basic_urls.append('Possible Uparsed URL, please review manually')
            pass
    
    return basic_urls

links=[]
parser = argparse.ArgumentParser()
parser.add_argument("-f", "--file", help="File of URLS to be decoded", required=False, dest="file")
parser.add_argument("-u", "--url", help="Url to be decoded, sometimes quotes are reqired to parse through commandline", required=False, dest="url")

args = parser.parse_args()

if(args.file is None):
    links.append(str(args.url))
else:
    with open(str(args.file), 'f') as f:
        links = f.readlines()

urls = decode_links_to_url(links)
for url in urls:
    print(url)