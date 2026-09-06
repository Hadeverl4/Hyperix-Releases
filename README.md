# Hyperix landing page

This directory is a static landing page for the Hyperix Website URL used in external project applications. It has no server, analytics, API key, or build step.

The repository includes `.github/workflows/website-pages.yml`, which publishes this directory through GitHub Pages after GitHub Pages is enabled for the repository. Use the resulting `https://<account>.github.io/<repository>/` address in external application forms. If the source repository remains private, publish this unchanged directory from a small public website repository instead; do not expose launcher secrets or private development files.
