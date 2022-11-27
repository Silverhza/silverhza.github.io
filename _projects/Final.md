---
name: Final Project, Part 3.1
tools: [Python, HTML, Altair]
image: assets/pngs/final.png
description: Draft final project by group 50.
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
* Dashboard Describe:  
  We created a visualization of the average number of wards of different types of crime objects for each day of the week in this city. As well as the distribution of the time of occurrence of different crime objects for each day of the week. We first created a heatmap with the x-axis of the visualization being the three types of crime objects (Person, Property, Society) and the y-axis being each day of the week. The color of the heatmap then represents the difference in the average number of victims. We link this heatmap to a bar chart. This allows us to see the number of different crime times occurring at that average ward number by selecting a different average ward number. This dashboard allows the layperson to understand the average number of wards, or victims, for each day of the week,what type of crimes these victims were subjected to, as well as the distribution of when these crimes occurred.

* Contextual Datasets:  
  Police Arrests Upload Datasets: https://data.illinois.gov/dataset/1d18ecc0-3c7e-4507-b8cc-7a5e30359d44/resource/ca1dceb3-01f8-4a56-935b-7e3035ff60a4/download/police-arrests-upload_20191226.csv  
  The contextual data we found were police arrest data for Urbana. This data has the same clear documentation of crimes in Urbana as the City of Rockford crime records that we used. And we found some very interesting elements on this data, such as the age, gender, and race of the arrestees. We think these variables can help us to analyze and predict the motives and trends of crime by combining or comparing the two data visualizations.

<br/>  
 
<center><vegachart schema-url="{{ site.baseurl }}/assets/json/contextual1.json" style="width: 100%"></vegachart></center>

<br/>  

<center><vegachart schema-url="{{ site.baseurl }}/assets/json/contextual2.json" style="width: 100%"></vegachart></center>

<br/> 

<!-- these are written in a combo of html and liquid --> 

<div class="left">
{% include elements/button.html link="https://data.illinois.gov/dataset/3bfc782a-baae-43ea-a29a-214fb1cb725e/resource/b23aa1b9-c0e0-4779-ba7a-6ca8b7b1df1c/download/cm_offense_archive.csv" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/Silverhza/silverhza.github.io/blob/main/python_notebooks/group50-final-project-part3.1.ipynb" text="The Analysis" %}
</div>

