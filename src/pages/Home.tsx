import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3x3, BookOpen, Zap, Target, Brain } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function Home() {
  const navigate = useNavigate();

  const gameTypes = [
    {
      id: 'wordsearch',
      title: 'Word Search',
      description: 'Find hidden words in a grid of letters',
      icon: Search,
      gradient: 'from-primary-500 to-yellow-500',
      features: ['Interactive grid', 'Multiple difficulty levels', 'Custom word lists'],
    },
    {
      id: 'crossword',
      title: 'Crossword Puzzle',
      description: 'Solve clues to fill in the crossword grid',
      icon: Grid3x3,
      gradient: 'from-secondary-500 to-purple-500',
      features: ['Interactive clues', 'Auto-validation', 'Custom definitions'],
    },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'Learn Complex Terms',
      description: 'Master jargon and specialized vocabulary through engaging gameplay',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get real-time validation and hints as you play',
    },
    {
      icon: Target,
      title: 'Custom Content',
      description: 'Import your own word lists and definitions',
    },
    {
      icon: Brain,
      title: 'Smart Generation',
      description: 'AI-powered puzzle generation for optimal learning',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Master <span className="text-primary-400">Complex Terms</span>
          <br />
          Through Interactive Play
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Transform your vocabulary learning with engaging word puzzles. Import your own terms or use our curated sets to build expertise in any field.
        </p>
      </div>

      {/* Game Types */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {gameTypes.map((game) => (
          <Card key={game.id} hover>
            <div
              onClick={() => navigate(`/import/${game.id}`)}
              className="cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${game.gradient} flex items-center justify-center mb-4`}>
                <game.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
              <p className="text-gray-300 mb-4">{game.description}</p>
              <ul className="space-y-2">
                {game.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Why Choose JargonPlay?</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Our platform combines the fun of puzzles with the power of targeted learning to help you master specialized vocabulary faster than traditional methods.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <feature.icon className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-400">{feature.description}</p>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <Card className="bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border-primary-500/20">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Learning?</h3>
          <p className="text-gray-300 mb-6">
            Choose your puzzle type and begin your vocabulary journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/import/wordsearch')}
              icon={Search}
            >
              Start Word Search
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/import/crossword')}
              icon={Grid3x3}
            >
              Start Crossword
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}