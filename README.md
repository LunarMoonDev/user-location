[![LinkedIn][linkedin-shield]](www.linkedin.com/in/harjit-brar)
[![Trello][Trello]](https://trello.com/b/CqcoYlXz/toy-project-user-location)


<!-- PROJECT LOGO -->
<br />
<div align="center">
<h3 align="center"></h3>
  <p align="center">
    Toy Project: User location
    <br />
    <a href="https://github.com/LunarMoonDev/user-location"><strong>Explore the docs »</strong></a>
    <br />
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

It's a toy project for a refresher on `nodejs` stack framework using `ExpressJs` and `MongoDB` with a some tools for optimization lide `Redis`. It's also demonstrates my skills and capability in using `NodeJs` framework. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

To start the project simply run the following command:
* yarn
  ```sh
  yarn install
  ```

### Prerequisites

A mongodb server must be `UP` before running the back-end server. To do so, please do the following command:
* mongodb
  ```sh
  sudo mongod --dbpath ~/data/db --bind_ip_all
  ```
<span style="color:Red">Note:</span> `WSL2` has its own internal networking, and to retrieve this IP for Mongoose. Simple use:
  ```sh
  ip addr | grep eth0
  ```

Redis must also be `UP` before running the server. To do so, please do the following command:
* redis
  ```sh
  sudo /etc/init.d/redis-server start
  ```

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[Trello]: https://img.shields.io/badge/Trello-%23026AA7.svg?style=for-the-badge&logo=Trello&logoColor=white
