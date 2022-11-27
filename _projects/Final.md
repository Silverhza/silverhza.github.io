---
name: Final Project, Part 3.1
tools: [Python, HTML, Altair]
image: assets/pngs/final.png
description: draft final project by group 50.
custom_js:
  - vega.min
  - vega-lite.min
  - vega-embed.min
  - justcharts
---

# <center>Final Project (Part 3.1)</center>   
<br/>
##### <center>Zian He & Junsong Yao</center>
<center>2022/11/26</center>  
<br/>  
 
<center><vegachart schema-url="{{ site.baseurl }}/assets/json/Final3.1.json" style="width: 100%"></vegachart></center>

<br/>  

#### Write-Up
<!-- * For the first visualization, we chose to use a heat map to visualize the number of records of alien occurrences and the size of the moon phases in each state. We chose to use a blue to yellow gradient to represent the contrast in the size of the moon phases. We did not transform the data because we thought the raw data would be sufficient for the visualization of the graph we wanted. We used a similar visualization method as in Assignment 9. However, to accommodate the Vega lite template, we chose to add the pattern content to the original code and leave the rest unchanged.

* For the second visualization, we created a heatmap plot and a barplot and merged them together. The interactive option was added so that we can get the frequency of the wind speed in the heatmap by selecting the pressure of each state in the heatmap. We chose to use a color gradient from yellow to blue, because it reflects the contrast in the size of the pressures. We did not do any transformation of the data because we thought that the existing variables of the data were enough to support the visualization we wanted. We used a similar visualization as in homework 9. However, to fit the Vega lite template, we chose to add the schema content to the original code and leave the rest unchanged. -->

<!-- these are written in a combo of html and liquid --> 

<div class="left">
{% include elements/button.html link="https://data.illinois.gov/dataset/3bfc782a-baae-43ea-a29a-214fb1cb725e/resource/b23aa1b9-c0e0-4779-ba7a-6ca8b7b1df1c/download/cm_offense_archive.csv" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/Silverhza/silverhza.github.io/blob/main/python_notebooks/group50-final-project-part3.1.ipynb" text="The Analysis" %}
</div>

