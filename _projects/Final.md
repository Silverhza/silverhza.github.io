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

![avatar](https://rockfordil.gov/wp-content/themes/rockford/assets/images/General/cor_logo_color.png)

# <center>Urban Crime Visualization</center>

<br/>

##### <center>Zian He & Junsong Yao</center>

<center>2022/11/26</center>

<br/>

![avatar](https://rockfordil.gov/wp-content/uploads/2016/08/cityscape_website_retouched.jpg)

<br/>

#### <center>Background</center>  
  A city's crime rate is always an important consideration in whether the city is a good place to live. And a city's crime data can also reflect many characteristics of the city. So, we want to analyze the crime data of Rockford city to get some visualization that will help us understand the crime situation of the city. We are also looking for crime reports for the city of Urbana to use as contextual data for our dashboard, and we hope to get some correlations in crime characteristics across cities from contextual visualization.  

<br/>

#### <center>Dashboard Describe</center>
  We created a visualization(Fig 1) of the average number of wards of different types of crime objects for each day of the week in this city. As well as the distribution of the time of occurrence of different crime objects for each day of the week. We first created a heatmap with the x-axis of the visualization being the three types of crime objects (Person, Property, Society) and the y-axis being each day of the week. The color of the heatmap then represents the difference in the average number of victims. We link this heatmap to a bar chart. This allows us to see the number of different crime times occurring at that average ward number by selecting a different average ward number. This dashboard allows the layperson to understand the average number of wards, or victims, for each day of the week, what type of crimes these victims were subjected to, as well as the distribution of when these crimes occurred.

<br/>

<center><vegachart schema-url="{{ site.baseurl }}/assets/json/Final3.1.json" style="width: 100%"></vegachart></center>
<center>Fig 1</center>

<br/>  

#### <center>Contextual Visualization</center>
  Police Arrests Upload Datasets: [Datasets Link](https://data.illinois.gov/dataset/1d18ecc0-3c7e-4507-b8cc-7a5e30359d44/resource/ca1dceb3-01f8-4a56-935b-7e3035ff60a4/download/police-arrests-upload_20191226.csv).  

  The contextual data we found were police arrest data for Urbana. This data has the same clear documentation of crimes in Urbana as the City of Rockford crime records that we used. And we found some very interesting elements in this data, such as the age, gender, and race of the arrestees. We think these variables can help us to analyze and predict the motives and trends of crime by combining or comparing the two data visualizations.    

  Because the entire police arrest data volume is very large, we chose to just use a data volume of 1000. Next, we created three contextual visualizations(Fig 2&3). The first graph is a histogram with the x-axis representing the age of the arrestees and the y-axis representing the number of arrestees of each age. And we categorized the race of the arrestees by color into Asian, Black, White, Hispanic, and Unknown. We can see the number of arrestees by looking at the length of each color in the bar. As you can see from this graph, the 20-25 age group has the highest number of arrests. White has the highest number of arrests in this age group. The second and third graphs of our second dashboard. the point plots above, the x-axis represents the reason the offender was arrested. the y-axis represents the method of the arrest. We have also divided each point into different racial groups by color. The bar chart below visualizes the number of arrests for each race. The x-axis represents the number of arrests and the y-axis represents the race of arrests. We can select the point in the dot plot by swiping the area with the mouse to see how the number of arrests for each race changes in comparison. We find that on-view arrests are the most common type of arrest, while warrant arrests are the least common type of arrest. We also find that the more serious arrests, such as warrant arrest or detention, have more blacks in them. The less severe types of arrests, such as summons, have more whites.



<br/>  
 
<center><vegachart schema-url="{{ site.baseurl }}/assets/json/contextual1.json" style="width: 100%"></vegachart></center>
<center>Fig 2</center>

<br/>  

<center><vegachart schema-url="{{ site.baseurl }}/assets/json/contextual2.json" style="width: 100%"></vegachart></center>
<center>Fig 3</center>

<br/> 

#### <center>Conclusion</center> 
  By visualizing the two dashboards and a graph, we found that the most frequent crimes in the city are crimes against property and occur most often on Mondays and Fridays. Crimes against individuals are concentrated on Saturdays and Sundays, while crimes against society are more evenly distributed. The age of the offenders is between 20 and 25, with whites being the most numerous, followed by blacks. And blacks were more often arrested for felonies, while whites were more often arrested for misdemeanors. We believe that through these visualization graphs we can effectively analyze and predict the crime trends in the city.

<br/> 

#### <center>Citation</center> 
* City of Rockford Crime Offenses 2011-Present - City of Rockford Crime Offenses 2011-Present - data.illinois.gov. (n.d.). [https://data.illinois.gov/dataset/116city_of_rockford_crime_offenses_2011present/resource/b23aa1b9-c0e0-4779-ba7a-6ca8b7b1df1c](https://data.illinois.gov/dataset/116city_of_rockford_crime_offenses_2011present/resource/b23aa1b9-c0e0-4779-ba7a-6ca8b7b1df1c)
* WIFR Newsroom. (2022, August 26). Rockford crime stats: Violent crimes down slightly, auto thefts rise. https://www.wifr.com. [https://www.wifr.com/2022/08/26/rockford-crime-stats-violent-crimes-down-slightly-auto-thefts-rise/](https://www.wifr.com/2022/08/26/rockford-crime-stats-violent-crimes-down-slightly-auto-thefts-rise/)
* Urbana Police Arrests - data.illinois.gov. (n.d.). [https://data.illinois.gov/dataset/police-arrests](https://data.illinois.gov/dataset/police-arrests)

<br/> 

<div style="display: flex; justify-content:space-between;">
            <figure style="text-align:center; flex:1;">
                <img src="https://canvas.illinois.edu/images/thumbnails/5684633/OjnIrFLUCbnwolwdaR1MbMWFB5B5QcMrKnee1kce" width="140px"/>
                <figcaption styles="text-align: center;">Zian He</figcaption>
            </figure>
            <figure style="text-align:center; flex:1;">
                <img src="https://canvas.illinois.edu/images/thumbnails/5594604/AtlWd77Xpw71Vxr3kl0odAeqj4xVAQkB18QlpUot" width="140px"/>
                <figcaption styles="text-align: center;">Junsong Yao</figcaption>
            </figure>
</div>

<br/>
<br/> 

<img src="https://marketing.illinois.edu/wp-content/uploads/2021/09/wordmark.png" width="250" />

<br/>
<br/> 

<!-- these are written in a combo of html and liquid --> 

<div class="left">
{% include elements/button.html link="https://data.illinois.gov/dataset/3bfc782a-baae-43ea-a29a-214fb1cb725e/resource/b23aa1b9-c0e0-4779-ba7a-6ca8b7b1df1c/download/cm_offense_archive.csv" text="The Data" %}
</div>

<div class="right">
{% include elements/button.html link="https://github.com/Silverhza/silverhza.github.io/blob/main/python_notebooks/group50-final-project-part3.1.ipynb" text="The Analysis" %}
</div>

