import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

export interface SeoMeta {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  canonical?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private title: Title, private meta: Meta) {}

  setTitle(title?: string) {
    if (!title) return;
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  setDescription(description?: string) {
    if (!description) return;
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  setImage(image?: string) {
    if (!image) return;
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  setUrl(url?: string) {
    if (!url) return;
    this.meta.updateTag({ property: 'og:url', content: url });
    this.setCanonical(url);
  }

  setCanonical(url?: string) {
    if (!url) return;
    let link: HTMLLinkElement | null = document.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setMeta(meta: SeoMeta = {}) {
    this.setTitle(meta.title);
    this.setDescription(meta.description);
    this.setImage(meta.image);
    this.setUrl(meta.url || meta.canonical);
  }

  addJsonLd(payload: any) {
    const scriptId = 'json-ld-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(payload);
  }
}
