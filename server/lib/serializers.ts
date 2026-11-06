import {
  ApplicationRecord,
  InstitutePartnershipRecord,
  MarketplaceListingRecord,
  OpportunityRecord,
  WorkshopRecord,
} from '../db/database';

export function serializeOpportunity(opportunity: OpportunityRecord) {
  return {
    id: opportunity.id,
    title: opportunity.title,
    company: opportunity.company_name,
    location: opportunity.location,
    type: opportunity.type,
    category: opportunity.category,
    compensation: opportunity.compensation,
    duration: opportunity.duration,
    description: opportunity.description,
    requirements: opportunity.requirements,
    skills: opportunity.skills,
    isRemote: opportunity.is_remote,
    postedDate: opportunity.posted_date,
    applicationDeadline: opportunity.application_deadline,
  };
}

export function serializeWorkshop(workshop: WorkshopRecord) {
  return {
    id: workshop.id,
    title: workshop.title,
    provider: workshop.provider_name,
    category: workshop.category,
    level: workshop.level,
    format: workshop.format,
    schedule: workshop.schedule,
    duration: workshop.duration,
    price: workshop.price,
    seatsTotal: workshop.seats_total,
    seatsBooked: workshop.seats_booked,
    instructor: workshop.instructor,
    overview: workshop.overview,
    syllabus: workshop.syllabus,
  };
}

export function serializeMarketplaceListing(listing: MarketplaceListingRecord) {
  return {
    id: listing.id,
    title: listing.title,
    creator: listing.creator_name,
    category: listing.category,
    price: listing.price,
    description: listing.description,
    specs: listing.specs,
    deliverableType: listing.deliverable_type,
  };
}

export function serializeInstitutePartnership(partnership: InstitutePartnershipRecord) {
  return {
    id: partnership.id,
    institutionName: partnership.institution_name,
    partnerCompany: partnership.partner_company,
    initiative: partnership.initiative,
    studentsInvolved: partnership.students_involved,
    status: partnership.status,
    term: partnership.term,
  };
}

export function serializeApplication(
  application: ApplicationRecord,
  opportunity?: OpportunityRecord | null,
  additional: Record<string, unknown> = {},
) {
  return {
    id: application.id,
    opportunityId: application.opportunity_id,
    studentId: application.student_id,
    studentName: application.student_name,
    coverNote: application.cover_note,
    portfolioLinks: application.portfolio_links,
    status: application.status,
    appliedDate: application.applied_date,
    updatedAt: application.updated_at,
    opportunityTitle: opportunity?.title || 'Opportunity',
    company: opportunity?.company_name || 'Partner Company',
    location: opportunity?.location || '',
    type: opportunity?.type || '',
    compensation: opportunity?.compensation || '',
    ...additional,
  };
}
