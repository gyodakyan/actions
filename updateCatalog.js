const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function getRepoTopics() {
    try {
        const owner = "gyodakyan";
        const repo = "actions";

        const { data } = await octokit.repos.getAllTopics({
            owner,
            repo,
        });

        console.log("Repository Topics:", data.names);

        for (const topic of data.names) {
            const repositories = await getRepositoriesByTopic(topic);

            const jsonData = JSON.stringify(repositories);

            fs.writeFile('./catalog/index.json', jsonData, (err) => {
                if (err) {
                    console.error('Error writing to file', err);
                } else {
                    console.log('JSON file has been saved.');
                }
            });
        }
    } catch (error) {
        console.error("Error fetching repository topics:", error.message);
        // fs.writeFileSync('errors.log', error.message);
    }
}

async function getRepositoriesByTopic(topic) {
    try {
        const response = await octokit.rest.search.repos({
            q: `topic:${topic}`,
            sort: "stars", // Optionally sort by stars
            order: "desc",
        });

        return response.data.items.map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            url: repo.html_url,
            description: repo.description,
            stars: repo.stargazers_count,
        }));

    } catch (error) {
        console.error("Error fetching repositories:", error);
        //fs.writeFileSync('errors.log', error.message);
    }
}

getRepoTopics();