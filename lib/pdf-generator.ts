import jsPDF from 'jspdf';
import { Task, Scenario } from './types';

// Definiert die Schriftarten
const FONT_NORMAL = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';

// Definiert die Farben
const COLOR_PRIMARY = '#1E40AF'; // Dunkelblau
const COLOR_TEXT = '#1F2937';    // Dunkelgrau
const COLOR_SUBTLE = '#6B7281';  // Grau
const COLOR_DONE = '#9CA3AF';   // Hellgrau für erledigte Aufgaben

// Definiert die Seiten-Dimensionen (A4 in mm)
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Konvertiert ein Bild von einer URL in ein Base64-Daten-URL.
 * @param url Die URL des Bildes.
 * @returns Ein Promise, das mit dem Base64-String des Bildes aufgelöst wird.
 */
const imageToBase64 = (url: string): Promise<{ dataUrl: string; width: number; height: number; }> => 
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Wichtig für Bilder von anderen Domains (z.B. Supabase Storage)
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg');
        resolve({ dataUrl: dataURL, width: img.width, height: img.height });
      } else {
        reject(new Error('Canvas-Kontext konnte nicht abgerufen werden.'));
      }
    };
    img.onerror = (error) => reject(error);
    img.src = url;
});


/**
 * Erzeugt ein PDF-Dokument für eine Checkliste.
 * @param scenario Das Szenario der Checkliste.
 * @param tasks Die Aufgaben der Checkliste.
 * @param groupedTasks Die nach Kategorien und Unterkategorien gruppierten Aufgaben.
 * @param categoryOrder Die Reihenfolge der Kategorien.
 * @param getSubcategoryOrder Eine Funktion, um die Reihenfolge der Unterkategorien zu erhalten.
 */
export const generateChecklistPDF = async (
  scenario: Scenario,
  tasks: Task[],
  groupedTasks: Record<string, Record<string, Task[]>>,
  categoryOrder: string[],
  getSubcategoryOrder: (category: string) => string[]
): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  let yPos = MARGIN;

  // Korrigiere den Titel, indem Sonderzeichen ersetzt werden
  const cleanedTitle = scenario.title.replace(/→/g, '-');

  /**
   * Fügt eine neue Seite hinzu, wenn der Inhalt den unteren Rand überschreitet.
   * @param spaceNeeded Der Platz, der für den nächsten Inhalt benötigt wird.
   */
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPos + spaceNeeded > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      yPos = MARGIN;
      addHeader(cleanedTitle); // Header auf jeder neuen Seite
    }
  };

  /**
   * Fügt die Kopfzeile zum Dokument hinzu.
   * @param title Der Titel der Checkliste.
   */
  const addHeader = (title: string) => {
    doc.setFont(FONT_BOLD);
    doc.setFontSize(18);
    doc.setTextColor(COLOR_PRIMARY);
    doc.text(title, MARGIN, yPos);

    doc.setFont(FONT_NORMAL);
    doc.setFontSize(10);
    doc.setTextColor(COLOR_SUBTLE);
    const date = new Date().toLocaleDateString('de-DE');
    doc.text(date, PAGE_WIDTH - MARGIN, yPos, { align: 'right' });
    
    yPos += 15;
  };

  /**
   * Zeichnet eine Trennlinie.
   */
  const addDivider = () => {
    doc.setDrawColor(COLOR_PRIMARY);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
    yPos += 5;
  };

  // ***** PDF-Erstellung beginnt hier *****

  addHeader(cleanedTitle);
  addDivider();

  // Iteriere durch die sortierten Kategorien
  for (const category of categoryOrder) {
    if (!groupedTasks[category]) continue;

    checkPageBreak(15);

    // Kategorie-Überschrift
    doc.setFont(FONT_BOLD);
    doc.setFontSize(14);
    doc.setTextColor(COLOR_TEXT);
    doc.text(category, MARGIN, yPos);
    yPos += 8;

    const subcategories = getSubcategoryOrder(category);

    // Iteriere durch die sortierten Unterkategorien
    for (const subcategory of subcategories) {
      if (!groupedTasks[category][subcategory]) continue;

      const tasks = groupedTasks[category][subcategory];
      const hasSubcategoryTitle = Object.keys(groupedTasks[category]).length > 1 || subcategory !== 'Allgemein';

      if (hasSubcategoryTitle) {
        checkPageBreak(10);
        
        // Unterkategorie-Überschrift
        doc.setFont(FONT_BOLD);
        doc.setFontSize(11);
        doc.setTextColor(COLOR_TEXT); // Geändert von COLOR_SUBTLE
        doc.text(subcategory, MARGIN + 5, yPos);
        yPos += 6;
      }
      
      // Iteriere durch die Aufgaben
      for (const task of tasks) {
        checkPageBreak(10);
        
        // Checkbox
        const checkboxX = MARGIN + 7;
        doc.setDrawColor(COLOR_TEXT);
        doc.setLineWidth(0.3);
        doc.rect(checkboxX, yPos - 3, 4, 4);

        // Titel der Aufgabe
        const titleX = checkboxX + 8;
        doc.setFont(FONT_NORMAL);
        doc.setFontSize(11);
        
        if (task.done) {
          doc.setTextColor(COLOR_DONE);
          // Haken in die Checkbox zeichnen
          doc.setFont(FONT_BOLD);
          doc.text('X', checkboxX + 1, yPos + 0.5);
          doc.setFont(FONT_NORMAL);
        } else {
          doc.setTextColor(COLOR_TEXT);
        }

        const titleLines = doc.splitTextToSize(task.title, CONTENT_WIDTH - 20);
        doc.text(titleLines, titleX, yPos);
        yPos += titleLines.length * 5;

        // Beschreibung (falls vorhanden)
        if (task.description) {
          checkPageBreak(8);
          doc.setFont(FONT_NORMAL);
          doc.setFontSize(9);
          doc.setTextColor(COLOR_SUBTLE);
          const descLines = doc.splitTextToSize(task.description, CONTENT_WIDTH - 20);
          doc.text(descLines, titleX, yPos);
          yPos += descLines.length * 3.5 + 2;
        }
        
        // Notizen (falls vorhanden)
        if (task.notes) {
          checkPageBreak(8);
          doc.setFont(FONT_BOLD);
          doc.setFontSize(9);
          doc.setTextColor(COLOR_SUBTLE);
          doc.text('Notiz:', titleX, yPos);
          
          doc.setFont(FONT_NORMAL);
          const noteLines = doc.splitTextToSize(task.notes, CONTENT_WIDTH - 28);
          doc.text(noteLines, titleX + 10, yPos);
          yPos += noteLines.length * 3.5 + 2;
        }

        // Link (falls vorhanden)
        if (task.link) {
          checkPageBreak(8);
          doc.setFont(FONT_BOLD);
          doc.setFontSize(9);
          doc.setTextColor(COLOR_SUBTLE);
          doc.text('Link:', titleX, yPos);
          
          doc.setFont(FONT_NORMAL);
          doc.setTextColor('#0000EE'); // Standard-Linkfarbe
          doc.textWithLink(task.link, titleX + 10, yPos, { url: task.link });
          yPos += 3.5 + 2;
        }

        // Bilder (falls vorhanden)
        // Kompatibilität für alte (image_url) und neue (image_urls) Datenstrukturen
        const imageUrls = task.image_urls || (task.image_url ? [task.image_url] : []);
        if (imageUrls && imageUrls.length > 0) {
          for (const imageUrl of imageUrls) {
            try {
              const { dataUrl, width, height } = await imageToBase64(imageUrl);
              
              const imgWidth = CONTENT_WIDTH - 20;
              const imgHeight = (height * imgWidth) / width;

              checkPageBreak(imgHeight + 5);

              doc.addImage(dataUrl, 'JPEG', titleX, yPos, imgWidth, imgHeight);
              yPos += imgHeight + 5;
            } catch (error) {
              console.error(`Bild konnte nicht geladen werden: ${imageUrl}`, error);
              checkPageBreak(8);
              doc.setFont(FONT_NORMAL);
              doc.setFontSize(9);
              doc.setTextColor('red');
              doc.text(`[Bild konnte nicht geladen werden: ${imageUrl}]`, titleX, yPos);
              yPos += 5;
            }
          }
        }


        yPos += 4; // Abstand zwischen Aufgaben
      }
    }
    yPos += 5; // Abstand zwischen Kategorien
  }

  // PDF speichern
  const filename = `${cleanedTitle.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};
