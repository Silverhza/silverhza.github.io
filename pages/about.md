---
layout: page
title: About
permalink: /about/
weight: 3
---

# **About Me**

Hi I am **{{ site.author.name }}**,<br>

Student @ UIUC

* ⚒️ C++ / Python / Java
* 🔭 Working on Robotics
* 📸 Like Photography
* 🍟🍔🍕🌭🍿🥓 Love delicious food!

<a href="https://github.com/Silverhza">
<img
  src="https://github-readme-stats.vercel.app/api?username=Silverhza&count_private=true&theme=vue"
  title="Silverhza&#039;s GitHub Stats"
  align="left"
  width="100%"
/>
</a>

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
</div>

<div class="row">
{% include about/timeline.html %}
</div>