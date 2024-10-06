import { md5 } from "../react/utils/crypto";

// Clean up unwanted tags (script, style, and JSON-LD)
function cleanHtml(html: string) {
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    html = html.replace(/<!--[\s\S]*?-->/g, '');  // Remove HTML comments
    html = html.replace(/\s*style=["'][^"']*["']/gi, ''); // Remove inline styles
    return html;
}

export function extractLinkedInProfileUrl(linkedInUrl: string): string {
    const profileBase = 'https://www.linkedin.com/in/';
    
    // Ensure the URL starts with the base profile URL
    if (!linkedInUrl.startsWith(profileBase)) {
      return linkedInUrl;
    }
  
    // Split the string at the base URL and the first `/` after the user part
    const remainingPart = linkedInUrl.substring(profileBase.length).split('/')[0];
  
    // Return the useful LinkedIn profile URL
    return `${profileBase}${remainingPart}`;
}

console.log('Action Tab script loaded');
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'gatherPageData') {
        const pageContent = cleanHtml(document.documentElement.outerHTML);
        const hash = md5(pageContent);
        const pageUrl = extractLinkedInProfileUrl(window.location.href);
        
        // Send the cleaned content and URL back to the popup
        sendResponse({
            _id: md5(pageUrl),
            content: pageContent,
            hash: hash,
            url: pageUrl
        });
    }
});

