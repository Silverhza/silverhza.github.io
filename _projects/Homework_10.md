---
name: Homework 10
tools: [Python, HTML, vega-lite]
image: assets/pngs/hw10.png
description: vega-lite plots with interactions.
custom_js:
  - vega.min
  - vega-lite.min
  - vega-embed.min
  - justcharts
---

# <center>Homework 10</center>   
<br/>
##### <center>Zian He & Junsong Yao</center>
<center>2022/10/30</center>  
<br/>  
 
<center><vegachart schema-url="{{ site.baseurl }}/assets/json/visualization1.json" style="width: 100%"></vegachart></center>
<center>Fig 1</center> 
<br/>  
<center><vegachart schema-url="{{ site.baseurl }}/assets/json/visualization2.json" style="width: 100%"></vegachart></center>
<center>Fig 2</center> 
<br/>
#### Write-Up
* For the first visualization, we chose to use a heat map to visualize the number of records of alien occurrences and the size of the moon phases in each state. We chose to use a blue to yellow gradient to represent the contrast in the size of the moon phases. We did not transform the data because we thought the raw data would be sufficient for the visualization of the graph we wanted. We used a similar visualization method as in Assignment 9. However, to accommodate the Vega lite template, we chose to add the pattern content to the original code and leave the rest unchanged.

* For the second visualization, we created a heatmap plot and a barplot and merged them together. The interactive option was added so that we can get the frequency of the wind speed in the heatmap by selecting the pressure of each state in the heatmap. We chose to use a color gradient from yellow to blue, because it reflects the contrast in the size of the pressures. We did not do any transformation of the data because we thought that the existing variables of the data were enough to support the visualization we wanted. We used a similar visualization as in homework 9. However, to fit the Vega lite template, we chose to add the schema content to the original code and leave the rest unchanged.

<!-- these are written in a combo of html and liquid --> 

<div class="left">
{% include elements/button.html link="https://raw.githubusercontent.com/UIUC-iSchool-DataViz/is445_bcubcg_fall2022/main/data/bfro_reports_fall2022.csv" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/Silverhza/silverhza.github.io/blob/main/python_notebooks/Assignment%2010.ipynb" text="The Analysis" %}
</div>

