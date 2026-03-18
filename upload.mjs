import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const url = 'https://ehbaenczvnphgiuwujoc.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYmFlbmN6dm5waGdpdXd1am9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzEyMzcsImV4cCI6MjA4NjMwNzIzN30.0BEWpZe2r95GEx1VHVBmjbC5hUI767LdG60c1LXoK6k';
const supabase = createClient(url, key);

async function upload() {
  const filePath = 'C:/Users/moora/.gemini/antigravity/brain/5ca18779-f3eb-467c-a4d1-e3bad7bf640c/media__1773834590713.jpg';
  const fileContent = fs.readFileSync(filePath);

  const { data, error } = await supabase.storage
    .from('news')
    .upload('news-1-cholera.jpg', fileContent, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) {
    console.error('Error uploading:', error);
  } else {
    console.log('Uploaded successfully:', data);
    
    const { data: { publicUrl } } = supabase.storage.from('news').getPublicUrl('news-1-cholera.jpg');
    console.log('Public URL:', publicUrl);

    const { error: updateError } = await supabase
      .from('news')
      .update({ image: publicUrl })
      .eq('item_id', 1);

    if (updateError) {
      console.error('Error updating news:', updateError);
    } else {
      console.log('News updated successfully with image!');
    }
  }
}

await upload();
