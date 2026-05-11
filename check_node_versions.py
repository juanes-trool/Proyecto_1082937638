import urllib.request 
html=urllib.request.urlopen('https://nodejs.org/dist/').read().decode('utf-8') 
versions=set() 
for part in html.split('href=" ") : ; echo    if part.startswith(" "v20.) : ; echo        versions.add(part.split(/)[0]) ; echo print(\n.join(sorted(versions)[:5])) ; python check_node_versions.py"
