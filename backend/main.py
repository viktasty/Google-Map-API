from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.proxy import Proxy, ProxyType
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import argparse
from itertools import permutations
import time
import csv
import re
import os

def get_time(tm):
	hm = re.findall("\d+", tm)
	hm = [int(x) for x in hm]
	if len(hm)==1 and 'hr' in tm or 'hour' in tm:
		return hm[0]*60
	elif len(hm)==1 and 'hr' not in tm and 'hour' not in tm:
		return hm[0]
	else:
		return(hm[0]*60+hm[1])

def write_to_csv(out,coordinates,url,tm,dst):

	if out not in os.listdir(os.getcwd()):
		fl = open(out,'w',newline='',encoding='utf-8-sig')
		writer = csv.writer(fl)
		# writer.writerow(['Coordinates','Time','URL','Distance'])
		fl.close()

	fl = open(out,'a',newline='',encoding='utf-8-sig')
	writer = csv.writer(fl)
	writer.writerow([url])#([coordinates,tm,url,dst])
	fl.close()

def main():
	parser = argparse.ArgumentParser(prog='ProgramName',
                    description='What the program does',
                    epilog='Text at the bottom of help')
	parser.add_argument('out')
	args = parser.parse_args()
	
	config = open('config.txt','r').readlines()
	config = [x.strip() for x in config if x.strip()!='']
	start,end = '',''
	coords = []
	for ln in config:
		if 'start>' in ln:
			start = ln.split('>')[-1]
		elif 'end>' in ln:
			end = ln.split('>')[-1]

	config = [x for x in config if '>' not in x]
	coords = list(permutations(config))
	coords = [list(x) for x in coords]
	for i in range(len(coords)):
		if start.lower()!='na' and end.lower()!='na':
			print(coords[i])
			coords[i] = [start]+coords[i]+[end]
		elif start.lower()=='na' and end.lower()!='na':
			coords[i] = coords[i]+[end]
		elif start.lower()!='na' and end.lower()=='na':
			coords[i] = [start] + coords[i]

	options = webdriver.ChromeOptions()
	options.add_experimental_option('excludeSwitches', ['enable-logging'])
	caps = DesiredCapabilities().CHROME
	caps["pageLoadStrategy"] = "eager"
	prefs = {"profile.default_content_setting_values.notifications" : 2}
	options.add_experimental_option("prefs",prefs)
	options.headless = True
	driver = webdriver.Chrome(executable_path=ChromeDriverManager().install(),options=options,desired_capabilities=caps)

	mn = 1800000000000000
	crd = ''
	url = ''
	total_dst = ''
	for x in coords:
		try:
			print(f'>>> Processing {x}')
			st = ''
			for q in x:
				st+=q+'/'
			st = st[:-1]
			lnk = f'https://www.google.com/maps/dir/{st}'
			print(lnk)
			driver.get(lnk)

			elm = WebDriverWait(driver, 8).until(EC.presence_of_element_located((By.XPATH, '//*[@id="section-directions-trip-0"]/div[1]/div[1]/div[1]/div[1]/span[1]')))
			tm = elm.text
			tm = get_time(tm)

			elm = WebDriverWait(driver, 8).until(EC.presence_of_element_located((By.XPATH, '//*[@id="section-directions-trip-0"]/div[1]/div[1]/div[1]/div[2]/div')))
			dst = elm.text.strip()
			
			print(f'>>> Time found: {tm} minutes')
			if tm<mn:
				mn = tm
				crd = st.replace('/',',')
				elm = WebDriverWait(driver, 8).until(EC.presence_of_element_located((By.XPATH, '//*[@id="section-directions-trip-0"]/div[1]/div[1]/div[4]/button')))
				driver.execute_script("arguments[0].click();", elm)
				time.sleep(5)
				url = driver.current_url
				total_dst = dst
		except Exception as e:
			print(e)

	write_to_csv(args.out,crd,url,str(mn)+' min',total_dst)
	print(f'>>> Shortest path: {st} | {url} | {mn} | {total_dst}')

main()