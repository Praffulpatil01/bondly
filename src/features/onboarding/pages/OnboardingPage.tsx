import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ChevronLeft, Camera, Sparkles, Heart, CheckCircle2, Loader2, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { auth } from '@/firebase/firebase';
import { updateDocument } from '@/firebase/firestore';
import { collections } from '@/firebase/collections';
import { doc } from 'firebase/firestore';

const INTERESTS = [
  'Music', 'Gaming', 'Movies', 'Anime', 'Sports',
  'Technology', 'Travel', 'Food', 'Photography',
  'Fitness', 'Books', 'Business', 'Art', 'Pets', 'Coding',
];

const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Spanish',
  'French', 'German', 'Japanese'
];

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const totalSteps = 6;
  const progressPercent = (step / totalSteps) * 100;

  // Form State
  const [nickname, setNickname] = React.useState('');
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [searchInterest, setSearchInterest] = React.useState('');
  const [language, setLanguage] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    const user = auth.currentUser;
    const demoUser = localStorage.getItem('Ryple_demo_user');
    
    if (!user && !demoUser) {
      toast.error('You must be logged in to complete onboarding.');
      return;
    }
    if (!user && !demoUser) {
      toast.error('You must be logged in to complete onboarding.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (user) {
        const profileRef = doc(collections.profiles, user.uid);
        await updateDocument(profileRef, {
          nickname,
          // We can cast because we know we are adding these fields, or we should define them in UserProfile if needed. 
          // Our UserProfile doesn't strictly have `interests` and `language` but we can add them to the firestore doc.
          // Better yet, let's just use updateDocument which takes Partial<UserProfile> and can include extra fields if we type cast.
          onboardingCompleted: true,
          updatedAt: Date.now()
        });
        
        // As a quick fix for extra fields like interests and language, we'll just save them to local storage or add them if the interface permits.
        // Actually, we'll update the profile document with them.
        await updateDocument(profileRef as any, {
          interests: selectedInterests,
          language: language,
        });
      }
      toast.success('Onboarding complete! Welcome to Ryple.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to save profile data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInterests = INTERESTS.filter((i) =>
    i.toLowerCase().includes(searchInterest.toLowerCase())
  );

  const slideVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  return (
    <div className="relative min-h-screen font-body-md text-on-surface bg-background">
      {/* Subtle Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[10%] opacity-20 text-primary"
        >
          <Sparkles size={32} />
        </motion.div>
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-40 right-[15%] opacity-10 text-primary"
        >
          <Heart size={48} fill="currentColor" />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 h-16 flex items-center px-5 md:px-10 justify-between bg-surface/80 backdrop-blur-xl">
        <span className="text-xl font-bold font-['Outfit'] text-primary">Ryple</span>
        {step > 1 && (
          <button
            onClick={prevStep}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant transition-colors"
          >
            <ChevronLeft size={24} className="text-on-surface-variant" />
          </button>
        )}
      </nav>

      <main className="relative z-10 min-h-screen pt-24 pb-12 flex flex-col items-center px-5 max-w-xl mx-auto">
        {/* Progress Indicator */}
        <div className="w-full mb-12">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">
              {Math.round(progressPercent)}% complete
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <div className="w-full relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* STEP 1: Welcome */}
              {step === 1 && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(109,94,247,0.2)] mb-8">
                    <Sparkles className="text-white" size={48} />
                  </div>
                  <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface mb-4">
                    Welcome to Ryple
                  </h1>
                  <p className="text-base text-on-surface-variant mb-10 max-w-sm">
                    Get ready to experience a secure, anonymous way to form real human connections. Let's set up your profile.
                  </p>
                  <Button className="w-full" onClick={nextStep}>
                    Get Started
                  </Button>
                </div>
              )}

              {/* STEP 2: Nickname */}
              {step === 2 && (
                <div className="w-full">
                  <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface mb-2">
                    What should we call you?
                  </h1>
                  <p className="text-base text-on-surface-variant mb-8">
                    This is how your new friends will see you.
                  </p>
                  
                  <div className="flex flex-col items-center justify-center p-8 bg-surface-container-low rounded-xl border border-dashed border-outline-variant mb-8">
                    <div className="w-24 h-24 rounded-full bg-primary-fixed mb-4 shadow-[0_4px_20px_rgba(109,94,247,0.08)] flex items-center justify-center">
                       <User size={40} className="text-primary opacity-50" />
                    </div>
                    <button className="text-primary text-sm font-semibold flex items-center gap-2 hover:opacity-80 transition-opacity">
                      <Camera size={18} />
                      Add a photo (Optional)
                    </button>
                  </div>

                  <div className="space-y-2 mb-8">
                    <Label htmlFor="nickname" className="ml-1">Nickname</Label>
                    <Input
                      id="nickname"
                      placeholder="e.g. DreamyCloud"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                    />
                    <div className="flex justify-between px-1 text-xs text-on-surface-variant">
                      <span>{nickname.length > 2 ? 'Available' : 'Minimum 3 chars'}</span>
                      <span>{nickname.length}/20</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={nextStep}
                    disabled={nickname.length < 3}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* STEP 3: Interests */}
              {step === 3 && (
                <div className="w-full">
                  <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface mb-2">
                    Choose your vibes
                  </h1>
                  <p className="text-base text-on-surface-variant mb-6">
                    Select at least 3 topics to help us find the right community for you.
                  </p>

                  <Input
                    placeholder="Search interests..."
                    value={searchInterest}
                    onChange={(e) => setSearchInterest(e.target.value)}
                    icon={<Search size={20} />}
                    className="mb-6"
                  />

                  <div className="flex flex-wrap gap-3 mb-10 h-64 overflow-y-auto pr-2 no-scrollbar">
                    {filteredInterests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedInterests((prev) => prev.filter((i) => i !== interest));
                            } else {
                              setSelectedInterests((prev) => [...prev, interest]);
                            }
                          }}
                          className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-[0_4px_12px_rgba(109,94,247,0.2)]'
                              : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={nextStep}
                    disabled={selectedInterests.length < 3}
                  >
                    Continue ({selectedInterests.length}/3 selected)
                  </Button>
                </div>
              )}

              {/* STEP 4: Language */}
              {step === 4 && (
                <div className="w-full">
                  <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface mb-2">
                    Preferred Language
                  </h1>
                  <p className="text-base text-on-surface-variant mb-8">
                    Which language do you prefer to chat in?
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`p-4 rounded-xl border transition-all text-left font-medium ${
                          language === lang
                            ? 'bg-primary-container border-primary text-on-primary-container shadow-[0_4px_12px_rgba(109,94,247,0.15)]'
                            : 'bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary/50'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={nextStep}
                    disabled={!language}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* STEP 5: Guidelines */}
              {step === 5 && (
                <div className="w-full">
                  <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface mb-2">
                    Community Guidelines
                  </h1>
                  <p className="text-base text-on-surface-variant mb-8">
                    Ryple is a safe space. Please review our rules before joining.
                  </p>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-8 space-y-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="text-primary shrink-0" size={24} />
                      <div>
                        <h4 className="font-semibold text-sm">Be Kind and Respectful</h4>
                        <p className="text-xs text-on-surface-variant mt-1">No harassment, hate speech, or bullying will be tolerated.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="text-primary shrink-0" size={24} />
                      <div>
                        <h4 className="font-semibold text-sm">Keep it Anonymous</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Do not share personal identifiable information in chats.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <CheckCircle2 className="text-primary shrink-0" size={24} />
                      <div>
                        <h4 className="font-semibold text-sm">Report Abuse</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Use the report button if anyone violates these rules.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-outline-variant/50 rounded-lg mb-8">
                    <Checkbox id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                        I agree to the Community Guidelines and Privacy Policy.
                      </Label>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={nextStep}
                    disabled={!agreed}
                  >
                    Accept & Continue
                  </Button>
                </div>
              )}

              {/* STEP 6: Complete */}
              {step === 6 && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-primary-fixed mb-6 shadow-[0_4px_20px_rgba(109,94,247,0.15)] flex items-center justify-center border-4 border-white">
                    <span className="text-2xl font-bold text-primary">{nickname.charAt(0).toUpperCase()}</span>
                  </div>
                  
                  <h1 className="text-3xl font-bold font-['Outfit'] text-on-surface mb-2">
                    You're all set, {nickname}!
                  </h1>
                  <p className="text-base text-on-surface-variant mb-8">
                    Your profile is ready. Let's start connecting with people who share your vibes.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {selectedInterests.slice(0, 5).map(interest => (
                      <span key={interest} className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface">
                        {interest}
                      </span>
                    ))}
                    {selectedInterests.length > 5 && (
                      <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-medium text-on-surface">
                        +{selectedInterests.length - 5} more
                      </span>
                    )}
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    onClick={handleComplete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                    Finish Setup
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
