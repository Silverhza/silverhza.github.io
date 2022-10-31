---
name: Vega-lite plots in Jekyll, Multiple Ways
tools: [Python, HTML, vega-lite]
image: assets/pngs/cars.png
description: Ways to get vega-lite plots in our webpages.
custom_js:
  - vega.min
  - vega-lite.min
  - vega-embed.min
  - justcharts
---

# Homework 10
#### By Zian He & Junsong Yao 
  
  
#### Fig 1
<vegachart schema-url="{{ site.baseurl }}/assets/json/visualization1.json" style="width: 100%"></vegachart>
#### Fig 2
<vegachart schema-url="{{ site.baseurl }}/assets/json/visualization2.json" style="width: 100%"></vegachart>

#### Write-Up

Example comes from this [great blog post right here](https://blog.4dcu.be/programming/2021/05/03/Interactive-Visualizations.html) that was also used in [our test import script](https://github.com/UIUC-iSchool-DataViz/is445_bcubcg_fall2022/blob/main/week01/test_imports_week01.ipynb).

<!-- these are written in a combo of html and liquid --> 

<div class="left">
{% include elements/button.html link="https://raw.githubusercontent.com/UIUC-iSchool-DataViz/is445_bcubcg_fall2022/main/data/bfro_reports_fall2022.csv" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/Silverhza/silverhza.github.io/blob/main/source/Assignment%2010.ipynb" text="The Analysis" %}
</div>

