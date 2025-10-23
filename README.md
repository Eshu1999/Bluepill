# Firebase Studio

This is a NextJS starter in Firebase Studio.

## How to Fix Large File Errors when Pushing to GitHub

If you are seeing errors about files being too large when you try to `git push`, it means that automatically generated files were accidentally added to your commit history.

To fix this, you must run a sequence of commands to clean your repository's history.

**Important:** This process will rewrite your commit history. This is safe to do in your own environment.

### Step-by-Step Instructions

Run these commands in your terminal, in this exact order:

1.  **Remove everything from the Git index.**
    This command clears Git's staging area. The `--cached` flag is crucial because it ensures your actual files are not deleted—it only removes them from what Git is tracking.

    ```bash
    git rm -r --cached .
    ```

2.  **Re-add all files.**
    This stages all your files again. This time, Git will automatically skip everything listed in your `.gitignore` files.

    ```bash
c    git add .
    ```

3.  **Create a new, clean commit.**
    This saves your changes. The commit message explains what you did.

    ```bash
    git commit -m "chore: Clean up repository and remove ignored files"
    ```

4.  **Push your changes.**
    After running the commands above, your `git push` should now succeed.

    ```bash
    git push origin main
    ```
