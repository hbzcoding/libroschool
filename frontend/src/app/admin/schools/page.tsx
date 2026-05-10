"use client";

import { useEffect, useState, useCallback } from "react";
import { adminService } from "@/services/admin";
import { School, SchoolsFilters } from "@/types/school";
import {
  DataTable,
  SearchInput,
  PageHeader,
  AdminLoadingState,
  AdminErrorState,
} from "@/features/admin/components/DataTable";
import { ConfirmDialog } from "@/features/admin/components/ConfirmDialog";
import { Column } from "@/features/admin/components/DataTable";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminSchoolsPage() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formProvince, setFormProvince] = useState("");
  const [formRegion, setFormRegion] = useState("");
  const [formCountry, setFormCountry] = useState("Italia");
  const [formType, setFormType] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchSchools = async () => {
      try {
        setIsLoading(true);
        const filters: SchoolsFilters = {
          page,
          per_page: 15,
        };
        if (search) filters.search = search;

        const response = await adminService.getSchools(filters);
        if (!cancelled) {
          setSchools(response.data);
          setTotalPages(response.meta.last_page);
          setTotal(response.meta.total);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError(t("admin.loadError"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchSchools();

    return () => {
      cancelled = true;
    };
  }, [search, page, t]);

  const fetchSchools = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: SchoolsFilters = {
        page,
        per_page: 15,
      };
      if (search) filters.search = search;

      const response = await adminService.getSchools(filters);
      setSchools(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
      setError(null);
    } catch {
      setError(t("admin.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  const handleCreate = async () => {
    if (!formCode || !formName || !formCity || !formProvince || !formRegion || !formType) {
      setFormError(t("admin.allFieldsRequired"));
      return;
    }
    try {
      setFormSubmitting(true);
      setFormError(null);
      await adminService.createSchool({
        code: formCode,
        name: formName,
        city: formCity,
        province: formProvince,
        region: formRegion,
        country: formCountry,
        school_type: formType,
      });
      setShowCreateForm(false);
      setFormCode("");
      setFormName("");
      setFormCity("");
      setFormProvince("");
      setFormRegion("");
      setFormCountry("Italia");
      setFormType("");
      await fetchSchools();
    } catch {
      setFormError(t("admin.createError"));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (schoolId: number) => {
    try {
      setActionLoading(schoolId);
      await adminService.deleteSchool(schoolId);
      await fetchSchools();
    } catch {
      // Error handled silently
    } finally {
      setActionLoading(null);
    }
  };

  const columns: Column<School>[] = [
    {
      key: "name",
      label: t("admin.tables.school"),
      render: (school) => (
        <div>
          <p className="text-sm font-medium text-[#f7f8f8] max-w-xs truncate">{school.name}</p>
          <p className="text-xs text-[#8a8f98]">{t("admin.tables.code")}: {school.code}</p>
        </div>
      ),
    },
    {
      key: "city",
      label: t("admin.tables.location"),
      render: (school) => (
        <div>
          <p className="text-sm text-[#d0d6e0]">{school.city}</p>
          <p className="text-xs text-[#8a8f98]">{school.province} • {school.region}</p>
        </div>
      ),
    },
    {
      key: "school_type",
      label: t("admin.tables.type"),
      render: (school) => (
        <span className="text-xs text-[#d0d6e0]">{school.school_type}</span>
      ),
    },
    {
      key: "actions",
      label: t("admin.tables.actions"),
      render: (school) => (
        <div className="flex items-center gap-1">
          <ConfirmDialog
            title={t("admin.actions.deleteSchool")}
            description={`${t("admin.confirmDeleteSchool")} "${school.name}"? ${t("admin.confirmDelete")}`}
            confirmLabel={t("admin.actions.deleteSchool")}
            variant="destructive"
            onConfirm={() => handleDelete(school.id)}
            trigger={
              <button
                disabled={actionLoading === school.id}
                className="rounded-md border border-red-800/50 bg-red-900/20 px-2.5 py-1 text-xs text-red-400 hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                {t("admin.actions.deleteSchool")}
              </button>
            }
          />
        </div>
      ),
    },
  ];

  if (isLoading && schools.length === 0) {
    return <AdminLoadingState />;
  }

  if (error && schools.length === 0) {
    return <AdminErrorState message={error} onRetry={fetchSchools} />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.schools")}
        description={`${total} ${t("admin.totalSchools")}`}
      >
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] transition-colors"
        >
          {showCreateForm ? t("admin.cancel") : t("admin.actions.addSchool")}
        </button>
      </PageHeader>

      {/* Create School Form */}
      {showCreateForm && (
        <div className="rounded-lg border border-[#23252a] bg-[#0f1011] p-4 mb-6">
          <h3 className="text-sm font-medium text-[#f7f8f8] mb-4">{t("admin.newSchool")}</h3>
          {formError && (
            <p className="text-xs text-red-400 mb-3">{formError}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              placeholder="Code (e.g. MIPC001)"
              className="rounded-lg border border-[#23252a] bg-[#141516] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2]"
            />
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="School Name"
              className="rounded-lg border border-[#23252a] bg-[#141516] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2]"
            />
            <input
              type="text"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              placeholder="Type (e.g. Liceo Scientifico)"
              className="rounded-lg border border-[#23252a] bg-[#141516] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2]"
            />
            <input
              type="text"
              value={formCity}
              onChange={(e) => setFormCity(e.target.value)}
              placeholder="City"
              className="rounded-lg border border-[#23252a] bg-[#141516] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2]"
            />
            <input
              type="text"
              value={formProvince}
              onChange={(e) => setFormProvince(e.target.value)}
              placeholder="Province (e.g. MI)"
              className="rounded-lg border border-[#23252a] bg-[#141516] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2]"
            />
            <input
              type="text"
              value={formRegion}
              onChange={(e) => setFormRegion(e.target.value)}
              placeholder="Region (e.g. Lombardia)"
              className="rounded-lg border border-[#23252a] bg-[#141516] px-3 py-2 text-sm text-[#f7f8f8] placeholder:text-[#62666d] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2]"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={formSubmitting}
              className="rounded-lg bg-[#5e6ad2] px-4 py-2 text-sm font-medium text-white hover:bg-[#828fff] transition-colors disabled:opacity-50"
            >
              {formSubmitting ? t("admin.creating") : t("admin.actions.addSchool")}
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t("admin.searchNameOrCity")}
        />
      </div>

      <DataTable
        columns={columns}
        data={schools}
        meta={{
          current_page: page,
          last_page: totalPages,
          total,
          per_page: 15,
        }}
        onPageChange={setPage}
        isLoading={isLoading}
        emptyMessage={t("admin.empty.schools")}
      />
    </div>
  );
}