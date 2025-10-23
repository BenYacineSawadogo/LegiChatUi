import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

/**
 * Pipe to convert Markdown to HTML
 * Converts **bold**, *italic*, [links](url), lists, etc.
 */
@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
    // Configure marked options
    marked.setOptions({
      breaks: true,  // Convert \n to <br>
      gfm: true,     // GitHub Flavored Markdown
    });
  }

  transform(value: string): SafeHtml {
    if (!value) {
      return '';
    }

    try {
      // Convert Markdown to HTML
      const html = marked.parse(value) as string;

      // Sanitize and return safe HTML
      return this.sanitizer.sanitize(1, html) || '';
    } catch (error) {
      console.error('Error parsing Markdown:', error);
      return value; // Return original text if parsing fails
    }
  }
}
