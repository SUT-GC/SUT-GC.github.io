#! -*- coding:utf8 -*-

from HTMLParser import HTMLParser
import os

class MyHTMLParser(HTMLParser):   
    def __init__(self):   
        HTMLParser.__init__(self)   
        self.links = []   
    def handle_starttag(self, tag, attrs):   
        #print "Encountered the beginning of a %s tag" % tag   
        if tag == "img" or tag == "script":   
            if len(attrs) == 0:   
                pass   
            else:   
                for (variable, value) in attrs:   
                    if variable == "src":   
                        self.links.append(value)  

        if tag == 'link':
            if len(attrs) == 0:   
                pass   
            else:   
                for (variable, value) in attrs:   
                    if variable == "href":   
                        self.links.append(value)


def get_file_path(html_code):
    hp = MyHTMLParser()   
    hp.feed(html_code)   
    hp.close() 

    return hp.links


def get_html_code(file_path):
    r_file = open(file_path, "r")

    str_code = r_file.read()
    
    return str_code


def check_file_exist(file_links):
    not_exit_file = []
    for file_link in file_links:
        if not os.path.exists(file_link):
            not_exit_file.append(file_link)

    return not_exit_file


if __name__ == "__main__":
    root_path = '../'
    index_file = root_path+"index.html"

    html_code = get_html_code(index_file)
    file_links = [root_path+x for x in get_file_path(html_code)]
    result = check_file_exist(file_links)

    if result:
        raise Exception("%s not exist" % result)
    else:
        print 'check 100% success'
