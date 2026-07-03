import { Header } from '@/components/layout/header';
import { SpeakingPractice } from '@/SpeakingPractice';

export default function SpeakingPage() {
  return (
    <div>
      <Header
        title="Speaking Practice"
        subtitle="Practice fluency with random conversation topics"
      />
      <SpeakingPractice />
    </div>
  );
}
